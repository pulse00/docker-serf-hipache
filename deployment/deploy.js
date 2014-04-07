var Hipache = require('./hipache.js');
var Deployer = require('./deployer.js');

var hipache = new Hipache('192.168.50.190', 6379, "frontend:vagrant.local");
var deployer = new Deployer('/var/run/docker.sock', hipache, "docker.hipache:5000/nginx", ["/bin/bash", "/opt/startup.sh"]);
deployer.deployContainer();

// timeout after 30 seconds
setTimeout(function() {
	console.log('Timeout during deployment');
	process.exit(1);
}, 30000);

