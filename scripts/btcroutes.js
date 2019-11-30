
/*
 *  btcroutes.js
 *  Package: shhwallet
 *
 *  Description : Bitcoind Server Routes..
 *  Author: Arun Panneerselvam
 *  email: aeroarunn@live.com
 *  website: aeroarunn.com
 */

"use strict";

const config    = require( "./config.js"  );
var express     = require('express');
var User        = require('../model/user.js'); // get  user model
var rlog        = require('../model/requests.js'); //get req logger model
var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var md5         = require('md5');
var sha256      = require('sha256');
var http        = require('http');
var request     = require('request');
var fs          = require('fs');
var util        = require('util');
var Promise     = require('promise');
var randWord    = require('./random.js');
const Client    = require('bitcoin-core');

//Blockchain object
var bc  = require('./blockchain.js');


// Bitcoind client
const client = new Client(config.bitcoind);

//Route
var btcRoutes   = express.Router();

/*
 *  //Uncomment this section for jwt authorization
 *  Verify authentication token

btcRoutes.use(function(req, res, next) {
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
 */
/*
 *  API Routes for bitcoind server
 *  Welcome message (GET http://localhost:port/bitcoind/)
 *  Method : GET
 */

btcRoutes.get('/', function(req, res) {
  //res.send({ message: 'SHH Networks - Bitcoin Server' });

    client.command('getinfo').then((info) => res.json(info));

});

btcRoutes.get('/userwallet', function(req,res) {
    var uname = req.query.username;
    res.format({
            'text/plain': function () {

                res.send({
                    receivedbyAddresses    : bc.receivedbyAddresses.find(o => o.account === uname),
                });
            },
        });
});

/*
 * return information about the bitcoin server
 * Method : GET
 */
btcRoutes.get('/info', function(req, res) {
    res.format({
            'text/plain': function () {

                res.send({
                    client_info            : bc.client_info,
                    mining_info            : bc.mining_info,
                    bestblockhash          : bc.bestblockhash,
                    receivedbyAccounts     : bc.receivedbyAccounts,
                    receivedbyAddresses    : bc.receivedbyAddresses,
                    defaultAddress         : bc.defaultAddress,
                    exchange_rates         : bc.exchangerates,
                });
            },
        });
});

/*
 * return all api users as JSON object (GET http://localhost:port/api/users)
 * Method : GET
 */
btcRoutes.get('/userinfo', function(req, res) {
var uname = req.query.name || req.body.name;
var pass  = req.query.pass || req.body.pass;
    console.log({ name : uname, pass : pass});
    User.find({ name : uname, pass : pass }, function (err, user){
        res.format({
            'application/json': function () {   //res.send({success: false, message: 'Failed processing request, try again!'});
                if (err) res.send({success: false, message: 'Failed processing request, try again!'});
                else
                    user.forEach(function(u) {  }); // u.pass = u.secret = u.token = 'forbidden'; });
                    res.json({data : user });
            },
        });
    });
});


/*
 * Create API User
 */
btcRoutes.get('/newuser', function(req, res) {

    var uname = req.query.name || req.body.name;
    var acc_name = req.query.acc_name || req.body.acc_name;
    var pass  = req.query.pass || req.body.pass;

    User.find({ name : uname, pass : pass, acc_name : acc_name }, function (err, user) {
        console.log(user.length);
        if (user.length > 0) {
            res.format({ 'application/json': function () {  res.json({success: false, msg: "User already exists!", user: user[0]}); } });
        } else {
            console.log('creating new user account.. ');
            var addresses = {};
            var words = randWord(12);

            // Get Addresses
             try {
                addresses = bc.getUserNewAddress(words.join(" "));
             } catch (e) { console.log(e); }

             var thisUser = new User({
                 name: uname,
                 pass: pass,
                 token: sha256(uname),
                 secret: sha256(uname + pass + Date.now()),
                 updated: Date.now(),
                 status: true,
                 admin: false,
                 acc_name: acc_name,
                 acc_address: addresses.bitcoin.addr,
                 priv_key: addresses.bitcoin.wif,
                 ltc_address: addresses.litecoin.addr,
                 ltc_priv_key: addresses.litecoin.wif,
             });

             // save the sample user

             thisUser.save(function (err) {
                 if (err) res.send({success: false, msg: "Error creating new user!"});
                 console.log('User saved successfully');
                 res.send({success: true, user: thisUser, random: words.join(" ")});
             });
        }
    });



});

/*
 * return information about the bitcoin server
 * Method : GET
 */
btcRoutes.get('/bestblockhash', function(req, res) {

        res.format({
            'text/plain': function () {
                    client.command('getbestblockhash').then((bbhash) => res.json(bbhash));
            },
        });
});

/*
 * return information about the bitcoin server
 * Method : GET
 */
btcRoutes.get('/block', function(req, res) {
var blockhash = req.body.blockhash || req.query.blockhash;
    console.log('Blockhash : ' + blockhash);
const batch = [
    { method: 'getblockcount', parameters: [] },
  { method: 'getblock', parameters: [blockhash] },
];
        res.format({
            'text/plain': function () {

                   client.command(batch).then(([count,blk]) => res.json({ count : count, block :  blk }));
            },
        });
});

/*
 * return information about the bitcoin server
 * Method : GET
 */
btcRoutes.get('/generateaddress', function(req, res) {
var id = req.body._id || req.query.blockhash;
    console.log('Blockhash : ' + blockhash);
const batch = [
  { method: 'getblockcount', parameters: [] },
  { method: 'getblock', parameters: [blockhash] },
];
        res.format({
            'text/plain': function () {

                   client.command(batch).then(([count,blk]) => res.json({ count : count, block :  blk }));
            },
        });
});



/*
 * const batch = [{ method: 'getnewaddress' }, { method: 'validateaddress', parameters: ['mkteeBFmGkraJaWN5WzqHCjmbQWVrPo5X3'] }];
 */


/*
 * Valid Address for transaction and process
 * Method : GET
 */
btcRoutes.get('/vaddr', function(req, res) {
var address = req.body.address || req.query.address;
var btc   = req.body.btc || req.query.btc;
    console.log(address);
    console.log(btc);
const batch = [
  { method: 'getnewaddress', parameters: [account_name] },
  { method: 'getaccountaddress', parameters: [account_name] },
];

    if(isNewAddress) {
        res.format({
            'text/plain': function () {
                client.command(batch).then(([new_address, account_address]) => res.json({ newaddress : new_address, accaddress: account_address}) );

            },
        });

    } else {
        res.format({
            'text/plain': function () {
                client.command('getaccountaddress').then((address) => res.json(address) );
            },
        });
    }

});


/*
 * List transactions for account
 * Method : GET
 */
btcRoutes.get('/lsttx', function(req, res) {
var name = req.body.account_name || req.query.account_name;
var noOf = req.body.noOf || req.query.noOf;
var from = req.body.from || req.query.from;

const batch = [
  { method: 'listtransactions', parameters: [name, 10, from] },
];
        res.format({
            'text/plain': function () {
                   client.command(batch).then((accounts) => (res.json(accounts)));
            },
        });


});

/*
 * return all wallet balances
 * Method : GET
 */
btcRoutes.get('/balance', function(req, res) {

        res.format({
            'text/plain': function () {
                    client.command('getbalance').then((balance) => res.json({balance : balance.toString()}));
            },
        });
});



/*
 * Send Bitcoins to wallet
 */
btcRoutes.get('/sendtx', function (req, res) {
    res.format({
        'text/plain': function () {
            try{
                  var sent_tx = bc.send(req.query.toAddress,req.query.amount, req.query.comment,req.query.comment_to, true);
                 res.send(sent_tx);
                } catch(e) { res.send(e); }
        },
    });
});

/*
 * Get Key pairs
 */



btcRoutes.get('/keypairs', function (req, res) {

    res.format({
        'text/plain': function () {
        try{
             var kp = bc.getKeyPairs(randWord(12).join(" "));
             res.send(kp);
            } catch(e) { res.send(e); }
        },
    });
});

/*
 * Get New BTC & LTC address for user
 */

btcRoutes.get('/usernewaddress', function (req, res) {
    res.format({
        'text/plain': function () {
            try{
                  var addresses = bc.getUserNewAddress(req.query.words.split(",").join(" "));
                  console.log(addresses);
                 res.send(addresses);
                } catch(e) { res.send(e); }
        },
    });
});

/*
 *  Get Keypairs
 */

btcRoutes.get('/keypairs', function(req,res) {
    res.format({
        'text/plain': function () {
            try{
                  var keypairs = bc.getKeyPairs();
                  res.send(keypairs);
                } catch(e) { res.send(e); }
        },
    });
});


/*
 *  Get transaction
 */

btcRoutes.get('/tx', function(req,res) {
    console.log(req.query.txID);
   res.format({
        'text/plain': function () {
            try{
                const batch = [{ method: 'gettransaction', parameters: [req.query.txID] },];
                client.command(batch).then((results) => res.send(results));
                } catch(e) { res.send(e); }
        },
    });
});

/*
 *  Finally the Exchange Rates
 */
btcRoutes.get('/exchangerates', function(req,res) {
    //console.log(bc);
    res.format({
        'text/plain': function () {
            try{
                 var btcusd = bc.getExchangeRates('btcusd');
                 var btceur = bc.getExchangeRates('btceur');
                setTimeout(function() {
                    res.send({btcusd,btceur});
                }, 2000);

                } catch(e) { res.send(e); }
        },
    });
});






// Export the Module
module.exports = btcRoutes;





