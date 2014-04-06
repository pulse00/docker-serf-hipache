
var redis = require("redis"),
        client = redis.createClient(6379, '192.168.50.190');


client.on("error", function (err) {
    console.log("Error " + err);
});

var Docker = require('dockerode');
var docker = new Docker({socketPath: '/var/run/docker.sock'});


function startContainer(port) {
        console.log('starting container at port' + port);
	docker.createContainer({Env:["CONTAINER_ID=" + port],  Image: 'docker.hipache:5000/nginx', Cmd: ["/bin/bash", "/opt/startup.sh"]}, function(err, container) {
		console.log('container start error code');
		console.log(err);
		var startOptions = {
			"PortBindings" : {
				"80/tcp" : [{
					"HostIp": "0.0.0.0",
					"HostPort" : port
				}]
			}
		};
		container.start(startOptions, function(e, data) { console.log('container started.'); } );
	});
}

function deployLatest(containers) {

	console.log('deploying latest nginx version');

	if (containers.length == 0) {
		console.log('no running containers, starting one...');
		startContainer("8899");
	} else if (containers.length == 1) {

		var availablePorts = ["8899", "8898"];

		var container = containers[0];
		var ports = container.Ports;
		var port = ports[0].PublicPort;
		var index = availablePorts.indexOf(port.toString());
		if (index > -1){
			availablePorts.splice(index, 1);
		}
                
		startContainer(availablePorts[0]);
                client.rpush(["frontend:vagrant.local", "http://192.168.50.195:" + availablePorts[0]], function(err, res) {

			console.log('removing from load balancer and stopping old container');
			client.lrem(["frontend:vagrant.local", 10, "http://192.168.50.195:" + port ], function(err, res) {
				console.log('removed from load balancer');
			});

	                docker.getContainer(container.Id).stop(function() {
                        	console.log('old container stopped');
                	});
		});
	} else {
		console.log('error');
	}
}

console.log('pulling latest nginx image...');

// pull the latest version of the image
docker.pull("docker.hipache:5000/nginx", function(){

	console.log('pulled latest nginx image');

	docker.listContainers(function(err, containers) {
		deployLatest(containers);		
	});
});

