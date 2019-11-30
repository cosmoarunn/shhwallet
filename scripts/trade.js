/*
 *  Trade.js
 *  Package: shhwallet
 *
 *  Description : blockchain API for SHH Wallet. Here we hold all the interactions with our own node.
 *
 *  Author: Arun Panneerselvam
 *  email: arun@gsunitedtechnologies.com/aeroarunn@live.com
 *  website: arunpanneerselvam.com
 */

//
"use strict";

const config    = require( "./config.js"  );
var express     = require('express');
var User        = require('../model/user.js'); // get  user model
var rlog        = require('../model/requests.js'); //get req logger model
var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var md5         = require('md5')
var http        = require('http');
var request     = require('request');
var fs          = require('fs');
var util        = require('util');
var Promise     = require('promise');


// Bitcoind client
//const client = new Client(config.bitcoind);

//Route
var tradeRoutes   = express.Router();


/*
 *
 *  Verify authentication token
 */
tradeRoutes.use(function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.api['secret'], function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Token authentication failed.'});
            } else {
                // confirm authentication to routes
                req.decoded = decoded;
                next();
            }
        });

    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'Token exchange failed.'
        });

    }
});



/*
 *  API Routes for trading server
 *  Welcome message (GET http://localhost:port/bitcoind/)
 *  Method : GET
 */

tradeRoutes.get('/', function(req, res) {
  //res.send({ message: 'SHH Networks - Bitcoin Server' });
    res.format({
        'text/plain': function () {
            json.send
        },
    });
});



// Export the Module
module.exports = tradeRoutes;