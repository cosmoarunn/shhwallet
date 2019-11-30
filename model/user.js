// get an instance of mongoose and mongoose.Schema
const config = require( "../scripts/config.js"  );
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');


var userhash = function(data) {
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

var user = new Schema({
    //id: ObjectId,
    name: {type : String, default: ''},
    pass: {type : String, default: ''},
    token: {type : String, default: ''},
    secret: {type : String, default: ''},
    updated: { type:Date, default : new Date },
    status: {type: Boolean, default : false },
    admin: {type : Boolean, default : false},
    acc_name: { type: String, default: ''},
    acc_address: { type: String, default: ''},
    priv_key: { type: String, default: ''},
    ltc_address: { type: String, default: ''},
    ltc_priv_key: { type: String, default: ''},

});

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', user);
/*
 * Mongoose Schema types
 *
 *
  var schema = new Schema({
  name:    String,
  binary:  Buffer,
  living:  Boolean,
  updated: { type: Date, default: Date.now },
  age:     { type: Number, min: 18, max: 65 },
  mixed:   Schema.Types.Mixed,
  _someId: Schema.Types.ObjectId,
  array:      [],
  ofString:   [String],
  ofNumber:   [Number],
  ofDates:    [Date],
  ofBuffer:   [Buffer], 
  ofBoolean:  [Boolean],
  ofMixed:    [Schema.Types.Mixed],
  ofObjectId: [Schema.Types.O
    */