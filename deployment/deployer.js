var Docker = require('dockerode');

/**
 * The Deployer can start/stop docker containers and connect/disconnect them as backends in hipache.
 *
 * @param dockerSocket
 * @param hipache
 * @param image the name of the docker image to be used for deployment
 * @param commmand an array of commands the docker container should run
 * @param ports the array of ports which should be used for the containers
 * @constructor
 */
function Deployer(dockerSocket, hipache, image, command, ports) {
    this.hipache = hipache;

    if (!ports) {
        this.ports = ['8899', '8898'];
    } else {
        this.ports = ports;
    }

    if (this.ports.length !== 2) {
        throw new Error('You need to specify 2 ports which will be used for switching containers during deployment');
    }

    this.image = image;
    this.command = command;
    this.docker = new Docker({socketPath: dockerSocket});
}

/**
 * Exit the process with an error code.
 * @param err
 */
Deployer.prototype.exitWithError = function (err) {
    console.log('Error creating container');
    console.log(err);
    process.exit(1);
}

/**
 * Redeploy a specific container:
 *
 * - Starts a new one with a different port (taken from the ports array)
 * - Adds the new container as a backend to the hipache load balancer
 * - Removes the old backend from hipache
 * - Stops the old container
 *
 * @param container
 * @param successCallback
 * @param errorCallback
 */
Deployer.prototype.redeploy = function (container, successCallback, errorCallback) {

    console.log('redeploying latest nginx version');

    var self = this;
    var ports = container.Ports;
    var port = ports[0].PublicPort;
    var index = this.ports.indexOf(port.toString());
    if (index > -1) {
        var oldPort = this.ports.splice(index, 1);
        var newPort = this.ports[0];
    } else {
        self.exitWithError("Error calculating container ports " + self.availablePorts);
    }

    this.startContainer(newPort, function (err) {
        errorCallback(err);
    }, function (data) {

        //TODO retrieve the host ip via node
        var backendIp = "http://192.168.50.195";
        self.hipache.replaceBackend(backendIp + ":" + oldPort, backendIp + ":" + newPort, function (err, data) {

            if (err) {
                self.exitWithError(err);
            }

            self.docker.getContainer(container.Id).stop(function () {
                console.log('old container stopped');
                process.exit(code = 0);
            });
        });
    });
}

/**
 * Starts a new container from the image provided to this Deployer instance.
 *
 * @param port
 * @param errorCallback
 * @param successCallback
 */
Deployer.prototype.startContainer = function (port, errorCallback, successCallback) {

    console.log('starting container at port ' + port);
    var self = this;

    this.docker.createContainer({Env: ["CONTAINER_ID=" + port], Image: this.image, Cmd: this.command}, function (err, container) {

        if (err) {
            errorCallback(err);
        }

        var startOptions = {
            "PortBindings": {
                "80/tcp": [
                    {
                        "HostIp": "0.0.0.0",
                        "HostPort": port
                    }
                ]
            }
        };

        container.start(startOptions, function (err, data) {
            if (err) {
                errorCallback(err);
            } else {
                successCallback(data);
            }
        });
    });
}


/**
 * Deploy a new container based on the image provided to this Deployer.
 *
 * If no containers are running, it will start a new one and register it with hipache.
 * If one container is running, it will spawn a new one on a different port, and reconnect
 * the old/new containers in hipache. See `redeploy` above.
 *
 */
Deployer.prototype.deployContainer = function () {

    console.log('pulling latest image of ' + this.image);
    var self = this;

    // pull the latest version of the image
    self.docker.pull(self.image, function (err, data) {

        if (err) {
            self.exitWithError(err);
        }

        self.docker.listContainers(function (err, containers) {

            //TODO: check if the containers have been started from the image provided to the Deployer
            if (containers.length == 0) {
                console.log('No containers running, starting a new one at port ' + self.ports[0]);
                self.startContainer(self.ports[0], function (err) {
                    self.exitWithError(err);
                }, function (data) {
                    console.log('Deployment successful');
                    process.exit(0);
                });
            } else if (containers.length == 1) {
                console.log('Redeploying running container');
                self.redeploy(containers[0], function (err) {
                    self.exitWithError(err);
                }, function (data) {
                    console.log('Deployment successful');
                    process.exit(0);
                });
            } else {
                self.exitWithError('There are more than one containers running for image ' + this.image);
            }
        });
    });
}

module.exports = Deployer;