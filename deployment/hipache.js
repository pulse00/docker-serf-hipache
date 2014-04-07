var redis = require("redis");

/**
 * Helper class used to configure the hipache backends in redis.
 *
 * @param host redis host
 * @param port redis port
 * @param redisKey The redis key for the hipache frontend
 * @constructor
 */
function Hipache(host, port, redisKey) {
	this.client = redis.createClient(port, host);

	this.client.on("error", function (err) {
	    console.log("Redis error " + err);
	});

    this.redisKey = redisKey;
}


/**
 * @param dns
 * @param callback
 */
Hipache.prototype.addBackend = function(dns, callback) {

    this.client.rpush([self.redisKey, dns], function(err, res) {
        callback(err, res);
    });
}

/**
 * @param dns
 * @param callback
 */
Hipache.prototype.removeBackend = function(dns, callback) {

    this.client.lrem([self.redisKey, 10, dns], function(err, res) {
        callback(err, res);
    });
}


/**
 * @param oldDns in the form 'http://ip:port'
 * @param newDns in the form 'http://ip:port'
 * @param callback
 */
Hipache.prototype.replaceBackend = function(oldDns, newDns, callback) {

	console.log('Replacing hipache backends, old => ' + oldDns + ", new => " + newDns);
	var self = this;

    self.addBackend(newDns, function(err, res) {

        if (err) {
            callback(err);
        } else {
            self.removeBackend(oldDns, function(err, res) {
                callback(err, res);
            })
        }
    });
}

// export the class
module.exports = Hipache;