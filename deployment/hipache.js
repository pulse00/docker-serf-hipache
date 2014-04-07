var redis = require("redis");

function Hipache(host, port) {
	this.client = redis.createClient(port, host);

	this.client.on("error", function (err) {
	    console.log("Redis error " + err);
	});
}

Hipache.prototype.replaceBackend = function(oldDns, newDns, callback) {

	console.log('Replacing hipache backends, old => ' + oldDns + ", new => " + newDns);

	var self = this;

	self.client.rpush(["frontend:vagrant.local", newDns], function(err, res) {

		if (err) {
			callback(err);
		}

		self.client.lrem(["frontend:vagrant.local", 10, oldDns], function(err, res) {
			callback(null, 'Hipache updated');
		});
	});
}

// export the class
module.exports = Hipache;