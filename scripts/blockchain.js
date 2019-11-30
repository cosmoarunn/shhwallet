/*
 *  blockchain.js
 *  Package: shhwallet
 *
 *  Description : blockchain API for SHH Wallet. Here we handle all the interactions with the server's bitcoin node.
 *
 *  Author: Arun Panneerselvam
 *  email: aeroarunn@live.com
 *  website: arunpanneerselvam.com
 */

//
"use strict";

const config    = require( "./config.js"  );
var express     = require('express');
var User        = require('../model/user.js'); // get  user model
var rlog        = require('../model/requests.js'); //get req logger model
var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var md5         = require('md5');
var http        = require('http');
var request     = require('request');
var fs          = require('fs');
var util        = require('util');
var Promise     = require('promise');
var bitcoinjs   = require('bitcoinjs-lib');
var bigi        = require('bigi');
const Client    = require('bitcoin-core');
const coinTicker = require('coin-ticker');

// Bitcoind client
const client = new Client(config.bitcoind);

const network = {
    mainnet: 8332,
    regtest: 18332,
    testnet: 18332
}

    /*
     * getkeys of an object
     */
    var getKeys = function(obj){
       var keys = [];
       for(var key in obj)   keys.push(key);
       return keys;
    }

    /*
     * Set Account with a given address
     *
     */
    var keypair = function() {
        var keyPair = bitcoinjs.ECPair.makeRandom()
        return ({'WIF' : bitcoinjs.ECPair.makeRandom().toWIF(), 'address' : bitcoinjs.ECPair.makeRandom().getAddress() });
    }


function rng () { return new Buffer(word) };


class Blockchain {
    constructor({
            network,
            client_info,
            mining_info,
            bestblockhash,
            bestblock,

            blocks,
            proximity,
            connections,

            defaultAddress,
            receivedbyAccounts,
            receivedbyAddresses,

            exchangerates,

            block,
            token,
            version,
            status,
            results,
            exchangeRateByCurrency,

        } = {}) {

            this.network =  config.bitcoind.network;// "mainnet";
            //Set the client information

            this.initialize();
            this.retrieveExchangeRates('btcusd');

    }

    /*
     *  Execute JSON RPC commands
     */
    command(...args) {
        return args;
    }
    /*
     * Initialize Blockchain Object
     */
    initialize() {
        this.bitcoindClientInfo();
    }
    /*
     *  Fill class data
     */
    filldata(...args) {

        var d = JSON.parse(args);

        this.client_info            = d['info'];
        this.mining_info            = d['minfo'],
        this.bestblockhash          = d['bbh'];
        this.receivedbyAccounts     = d['lacc'];
        this.receivedbyAddresses    = d['laddr'];
        this.defaultAddress         = d['daddr'][0];
        this.exchangeRateByCurrency = {};

    }
    /*
     * Get bitcoind client information
     */
    bitcoindClientInfo(...args) {

        const batch = [
          { method: 'getinfo', parameters: [] },
          { method: 'getmininginfo', parameters: [] },
          { method: 'getbestblockhash', parameters: [] },
          { method: 'listreceivedbyaccount', parameters: [0, true] },
          { method: 'listreceivedbyaddress', parameters: [0, true] },
          { method: 'getaddressesbyaccount', parameters: [""] },

        ];

            client.command(batch).then(([info,minfo, bbh, lacc,laddr,daddr]) => this.filldata(JSON.stringify({ 'info' : info, 'minfo' : minfo, 'bbh' : bbh, 'lacc': lacc, 'laddr' : laddr, 'daddr': daddr })));
    }

    /*
     *
     */
    getBestBlockHash() {  return this.bestblockhash; }

    /*
     * Get Best Block
     */
    getBestBlock() {

        const batch = [{ method: 'getblock', parameters: [this.bestblockhash] },];
        client.command(batch).then((block) => this.setBestBlock(block));

        setTimeout(function(){
            console.log(this.bestblock);
        }, 3000);
    }

    /*
     * Get Block data by hash
     *
     */
    getBlock(blockhash) {

        const batch = [{ method: 'getblock', parameters: [blockhash] },];
        client.command(batch).then((block) => this.filldata(JSON.stringify({ 'block': block })));
    }
    /*
     * Get address by account
     */
    getAddress(account) {
        const batch = [{ method: 'getaddressesbyaccount', parameters: [account] },];
        client.command(batch).then((block) => console.log(account));
    }

    /*
     * Validate bitcoin address
     */
    validateAddress(address) {


    }

    /*
     * Send bitcoins
     */
     send(btcAddress,amount,comment,comment_to,txfee) {
        //console.log('sending ' + amount.toString() + ' bitcoins to ' + btcAddress);
        //console.log({ btcAddress,amount,comment,comment_to });
        var results;
        const batch = [{ method: 'sendtoaddress', parameters: [btcAddress,parseFloat(amount),comment,comment_to,true] },];

        client.command(batch).then((results) => console.log(results));

        setTimeout(function(){
            return results;
        }, 100);
     }

    /*
     *  Get KeyPair
     */
    getKeyPairs(word){

    var address = {};
    if('undefined' !== word) {

        var hash = bitcoinjs.crypto.sha256(word);
        var d = bigi.fromBuffer(hash);
        var keyPair = new bitcoinjs.ECPair(d);
    } else { var keyPair = bitcoinjs.ECPair.makeRandom(); }

            // Print your private key (in WIF format)
            var kpWIF = keyPair.toWIF();
            // => Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct
            // Print your public key address
            var kpAddr = keyPair.getAddress();
            // => 14bZ7YWde4KdRb5YN7GYkToz3EHVCvRxkF

            address[kpWIF] = kpAddr;
            console.log(address);

        return address;
        //return({'WIF': kpWIF, Address: kpAddr});
    }

    /*
     *  Get KeyPair
     */


    getUserNewAddress(word){

    console.log('Requested user new address..  (with words : '+  word + ')');
    var address = {};


        if('undefined' !== word) {
            var hash = bitcoinjs.crypto.sha256(word);
            var d = bigi.fromBuffer(hash);
            var keyPair = new bitcoinjs.ECPair(d);

        } else { var keyPair = bitcoinjs.ECPair.makeRandom(); }

            // LiteCoin Address
            var litecoin    = bitcoinjs.networks.litecoin;

            var lcKeyPair   = bitcoinjs.ECPair.makeRandom({ network: litecoin });
            var lcWif       = lcKeyPair.toWIF();
            var lcAddress   = lcKeyPair.getAddress();

            // private key (in WIF format)
            var kpWIF       = keyPair.toWIF();
            var lcKpWIF     = lcKeyPair.toWIF();

            // public key address
            var kpAddr      = keyPair.getAddress();
            var lcKpAddr    = lcKeyPair.getAddress();
            // => 14bZ7YWde4KdRb5YN7GYkToz3EHVCvRxkF

            address['bitcoin'] = {'wif': kpWIF, 'addr' : kpAddr } ;
            address['litecoin'] = {'wif': lcKpWIF, 'addr' : lcKpAddr } ;
            //console.log(address);

        return address;
    }


    /*
     * Send bitcoins
     */
     createTx(txID,amount,pkWIF) {
        var tx = new bitcoinjs.TransactionBuilder();

        // Add the input (who is paying):
        // [previous transaction hash, index of the output to use]
        //var txId = '2929e95adcfa79333a66c39532893b761a7176381fbeb703f44fd9fe217c7af9'
        tx.addInput(txID, amount);

        // Add the output (who to pay to):
        // [payee's address, amount in satoshis]
        tx.addOutput("1DFWF7CKxhCc4Aj2UT3uj4mvhZRcqN9LnN", amount);

        // Initialize a private key using WIF
        var privateKeyWIF = pkWIF;
        var keyPair = bitcoinjs.ECPair.fromWIF(privateKeyWIF)

        // Sign the first input with the new key
        tx.sign(0, keyPair)

        // Print transaction serialized as hex
        console.log(tx.build().toHex())
        // => 0100000001313eb630b128102b60241ca895f1d0ffca21 ...

        // You could now push the transaction onto the Bitcoin network manually
        // (see https://blockchain.info/pushtx)
        //console.log(tx);
     }


    /*
     * Push a transaction to the network
     *
     */

    pushtx() {

    }

    /*
     * create a new account
     *
     */
    createAccount(name, address){
    if(address === 'undefined') address = bc.defaultAddress;
        var kp = keypair();

        var user = new User({
            name: name,
            pass: kp.WIF,
            acc_name: name,
            acc_address: address,
            token: md5(name),
            secret: md5(address),
            updated: Date.now(),
            status: true,
            admin: false
        });

        // save the sample user
        user.save(function (err) {
            if (err) console.log(err); //throw err;
            else {
                const batch = [{method: 'setaccount', parameters: [address, name]},];
                client.command(batch).then((response) => console.log({response}));

            }
        });

    }

    createAdminUser() {

         var admin = new User({
            name: 'aeroarunn',
            pass: 'sgpajsep2',
            acc_name: 'aeroarunn    ',
            acc_address: '1EQ4r8vBfvHR6anZu9kqpwMbADKd1bYGDT',
            token: '17rbCMnaDixPxmp',
            secret: '9mu2L4VeiWkPLXEoWAbvwzb-shhserver',
            updated: Date.now(),
            status: true,
            admin: true
        });

     // save the sample user
      admin.save(function(err) {
        if (err) throw err;

        console.log('User saved successfully');

      });

    }

    /*
     * Fill Exchange data
     */
    fillExchangeRates(key,value, exchange){
    //console.log('filling exchange data............');
    //console.log(value);
        this.exchangeRateByCurrency[exchange] = { 'pair' : key, 'data' : value };
    }
    /*
     *  Get Exchange rates
     */
    retrieveExchangeRates(currency) {
    if ('undefined' == currency) currency = 'btcusd';

         coinTicker('coinbase', currency).then((data) => this.fillExchangeRates(currency, data, 'coinbase'));
         coinTicker('kraken',   currency).then((data) => this.fillExchangeRates(currency, data, 'kraken'));
         coinTicker('btce',     currency).then((data) => this.fillExchangeRates(currency, data, 'btce'));
         coinTicker('bitfinex', currency).then((data) => this.fillExchangeRates(currency, data, 'bitfinex'));
         coinTicker('bitstamp', currency).then((data) => this.fillExchangeRates(currency, data, 'bitstamp'));
    }

    getExchangeRates(currency){
        this.retrieveExchangeRates(currency);
            console.log('returning exchange rates');
            return this.exchangeRateByCurrency;

    }









    getUsers() {
        User.find({}, function (err, users) {

                if (err) console.log(err);
                else
                    return users;  //users.forEach(function(u) {u.pass = u.secret = u.token = 'forbidden'; });


        });
    }





}


    /*
     * Get 5 Previous blocks
     */
    var prevBlocks = (hash, max) => {
        var blocks = {};
        var blockhash = hash;
        var count = 0;
        var status = false;

        //definition part
        function setBlockhash(h) {
            blockhash = h;
            console.log(blockhash);
        }

        function copyBlock(b)  {
            process.nextTick(function() {
                blocks[count] = b[0];
                console.log(blockhash + " ==> " +  b[0].previousblockhash);
                blockhash = b[0].previousblockhash;

            });

        }

        function process(b) {

            if(b === 'undefined') { getblock(blockhash); count = count+1; }
            console.log(blockhash + " ==> " +  b[0].previousblockhash);
                while (count < max) {
                setInterval(() => {
                    blocks[count] = b[0];
                    blockhash = b[0].previousblockhash;
                    getblock(blockhash);

                }, 1000);
                    count = count + 1;
                }
        }

        function getblock(bhash)  {
            console.log('Hash received to get block: ' + bhash);
            const batch = [{ method: 'getblock', parameters: [bhash] },];
                    client.command(batch).then((block) => process(block));
        }

        //Print the stored blocks
        function print() {
            console.log(blocks);
        }


        //Execution & Output part
        process();
        print();
        return blocks;
    }





var bc =  new Blockchain();

//console.log(keypair());
//bc.send('1DFWF7CKxhCc4Aj2UT3uj4mvhZRcqN9LnN',0.04,'test','test');


setTimeout(function(){
        //console.log(bc.defaultAddress);
        // To create a new user account with wallet address
        //bc.createAccount('cosmoarunn', bc.defaultAddress );
        //bc.createAdminUser();

        //bc.getUsers();
        //bc.createAdminUser();

       // bc.send('shhwallet','1CCK58t3XwEb7qozb3UQAx6Ea45shXx85F',0.0001,3,'test', 'test1');

        //bc.createTx('0376f12eb9f9f442301ce998b2db354d11232a0933b4400513128aef22f97c9d',3777000,'L4i5P45Sdy3vqMeuZggTQZ3Gt5K8hnmgnfHxreVyzTvZfLZbNC16');

        //bc.gettx('43d80d19d2ea4ce2f29500a62c602890359a96ed6151b5d175febb5fd7960ece');
        //bc.getExchangeRates('btcusd');



    }, 1000);




module.exports = new Blockchain();


/*

1DFWF7CKxhCc4Aj2UT3uj4mvhZRcqN9LnN
L4i5P45Sdy3vqMeuZggTQZ3Gt5K8hnmgnfHxreVyzTvZfLZbNC16

1EQ4r8vBfvHR6anZu9kqpwMbADKd1bYGDT
L1xjXAMjqY3XPLg9KkJciMyGo5rxL2fNPgjWArVq2W1NQpCEsbMz


    1AMfj5K8d1hd782CXdFjPhhA1Z4YLcWcJs
L54QCyeJY8fGXPcobF4gaS2YgmCZkLTci7juRFdw8xDxBxiu61Xr





{ L5mpi7N4teePwXGLGMccwcqq6ygh6VpYkTs4bQt4WKY6keeD86mc: '13iPZ47XaE8VTiqc6EQjB9kLQFdBSV2nLd' }



 */