
/*
 *  account.js
 *  Package: shhwallet
 *
 *  Description : Wallet Address mongoose model
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

var account = new Schema({
    id: ObjectId,
    user_id: { type : String, default: ''},
    WIF    : { type : String, default: ''},
    Addr   : { type : String, default: ''},
    status : { type: Boolean, default: false},
});

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('account', account);

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
  ofObjectId: [Schema.Types.ObjectId],
  nested: {
    stuff: { type: String, lowercase: true, trim: true }
  }
})
 */