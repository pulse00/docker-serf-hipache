var Docker = require('dockerode');

function Deployer(dockerSocket, hipache, image, command, ports) {
	this.hipache = hipache;

	if (!ports) {
		this.ports = ['8899', '8898'];
	} else {
		this.ports = ports;
	}

	this.image = image;
	this.command = command;
	this.docker = new Docker({socketPath: dockerSocket});
}

Deployer.prototype.exitWithError = function(err) {
	console.log('Error creating container');
	console.log(err);
	process.exit(1);
}

Deployer.prototype.redeploy = function(container, successCallback, errorCallback) {

	console.log('redeploying latest nginx version');

	var self = this;
	var ports = container.Ports;
	var port = ports[0].PublicPort;
	var index = this.ports.indexOf(port.toString());
	if (index > -1){
		var oldPort = this.ports.splice(index, 1);
		var newPort = this.ports[0];
	} else {
		self.exitWithError("Error calculating container ports " + self.availablePorts);
	}
            
	this.startContainer(newPort, function(err) {
		errorCallback(err);
	}, function(data) {

		//TODO retrieve the host ip via node
		var backendIp = "http://192.168.50.195";
		self.hipache.replaceBackend(backendIp + ":" + oldPort, backendIp + ":" + newPort, function(err, data) {

			if (err) {
				self.exitWithError(err);
			}

			self.docker.getContainer(container.Id).stop(function() {
		    	console.log('old container stopped');
		    	process.exit(code=0);
			});
		});
	});
}

Deployer.prototype.startContainer = function(port, errorCallback, successCallback) {

	console.log('starting container at port ' + port);
	var self = this;

	this.docker.createContainer({Env:["CONTAINER_ID=" + port],  Image: this.image, Cmd: this.command}, function(err, container) {

		if (err) {
			errorCallback(err);
		}

		var startOptions = {
			"PortBindings" : {
				"80/tcp" : [{
					"HostIp": "0.0.0.0",
					"HostPort" : port
				}]
			}
		};

		container.start(startOptions, function(err, data) {
			if (err) {
				errorCallback(err);
			} else {
				successCallback(data);
			}
		});
	});
}


Deployer.prototype.deployContainer = function() {

	console.log('pulling latest image of ' + this.image);
	var self = this;

	// pull the latest version of the image
	self.docker.pull(self.image, function(err, data) {

		if (err) {
			self.exitWithError(err);
		}

		self.docker.listContainers(function(err, containers) {

			if (containers.length == 0) {
				console.log('No containers running, starting a new one at port ' + self.ports[0]);
				self.startContainer(self.ports[0], function(err) {
					self.exitWithError(err);
				}, function(data) {
					console.log('Deployment successful');
					process.exit(0);
				});
			} else if (containers.length == 1) {
				console.log('Redeploying running container');
				self.redeploy(containers[0], function(err) {
					self.exitWithError(err);
				}, function(data) {
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