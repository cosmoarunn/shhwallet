
/*
 *  Wallet.js
 *  Package: shhwallet
 *
 *  Description : Bitcoind Wallet Routes..
 *  Author: Arun Panneerselvam
 *  email: arun@gsunitedtechnologies.com/aeroarunn@live.com
 *  website: arunpanneerselvam.com
 */

"use strict";

const config    = require( "./config.js"  );
var Block       = require('./block.js');
var express     = require('express');
var User        = require('../model/user.js'); // get  user model
var rlog        = require('../model/requests.js'); //get req logger model
var account     = require('../model/account.js'); 
var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var md5         = require('md5')
var http        = require('http');
var request     = require('request');
var fs          = require('fs');
var util        = require('util');
var Promise     = require('promise');
const Client    = require('bitcoin-core');
var bitcoin     = require('bitcoinjs-lib');


// Bitcoind client
const client = new Client(config.bitcoind);

const block = new Block();

//Route
var walletRoutes   = express.Router();

/*
 *
 *  Verify authentication token
 */
walletRoutes.use(function(req, res, next) {
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
 *  API Routes for bitcoind server
 *  Welcome message (GET http://localhost:port/bitcoind/)
 *  Method : GET
 */

walletRoutes.get('/', function(req, res) {
    res.send('Wallet Transactions');
});



/*
 * return a random address
 * Method : GET
 */
walletRoutes.get('/raddr', function(req, res) {
var keyPair = bitcoin.ECPair.makeRandom()

// Print your private key (in WIF format)
var kpWIF = keyPair.toWIF();
// => Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct

// Print your public key address
var kpAddr = keyPair.getAddress();
// => 14bZ7YWde4KdRb5YN7GYkToz3EHVCvRxkF

        res.format({
            'text/plain': function () {
                    res.json({'WIF' : kpWIF, Address : kpAddr});
            },
        });
});





// Export the Module
module.exports = walletRoutes;