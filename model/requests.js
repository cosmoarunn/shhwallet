
/*
 *  requests.js
 *  Package: shhwallet
 *
 *  Description : API User requests log
 *  Author: Arun Panneerselvam
 *  email: arun@gsunitedtechnologies.com/aeroarunn@live.com
 *  website: arunpanneerselvam.com
 */


const config = require( "../scripts/config.js"  );
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');


var reqhash = function(data) {
    hash = crypto.createHash('md5').update(data).digest("hex");
    return hash;
}

try {
    global.db = mongoose.connect(config.api.database); //- starting a db connection
}catch(err) {
    global.db = mongoose.createConnection(config.api.database); //- starting another db connection
}

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var logreq = new Schema({
    //id: ObjectId,
    u_id:  { type : String, default: ''},
    when: { type:Date, default : new Date },
    from: { type : String, default: '000.000.000.000'}
});

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('LogReq', logreq);
 