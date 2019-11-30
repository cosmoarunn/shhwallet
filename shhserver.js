/*
 *  ShhServer.js
 *  Package: shhwallet
 *
 *  Description : ShhWallet Server..
 *  Author: Arun Panneerselvam
 *  email: arun@gsunitedtechnologies.com/aeroarunn@live.com
 *  website: arunpanneerselvam.com
 */


var blockchain = require('./scripts/blockchain.js');

var shh = new blockchain();

//Start HTTP server at port
shh.startHttpServer(8125);
