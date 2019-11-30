    /*
     *  main.js
     *  Package: shhwallet
     *
     *  Description : Main entry point of the Authorization Server..
     *  Author: Arun Panneerselvam
     *  email: aeroarunn@live.com
     *  website: arunpanneerselvam.com
     */

 "use strict";


    const config    = require( "./config.js"  );
    var http        = require('http');
    var https       = require('https');
    var fs          = require('fs');
    var md5         = require('md5');
    var util        = require('util');
    var Promise     = require('promise');
    var express     = require('express');
    var sessions    = require("client-sessions");
    var request     = require('request');
    var bodyParser  = require('body-parser');
    var morgan      = require('morgan');
    var mongoose    = require('mongoose');
    var cors        = require('cors');
    var apiRoutes   = require('./routes.js');
    var btcRoutes   = require('./btcroutes.js');
    var tradeRoutes = require('./trade.js');

    var exec = require('child_process').exec;

    var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
    var User        = require('../model/user.js'); // get our mongoose model
    var ReqLog      = require('../model/requests.js'); //get req logger model

    //Blockchain object
    var blockchain  = require('./blockchain.js');

    /* --------------------------------------------------
     * Configuration
     *
     * --------------------------------------------------
     */
    /*
     * SSL Server Params
     */
    var options = {
        key     : fs.readFileSync('/home/shhwallet/wallet/ssh_keys/ssl.key'),
        cert    : fs.readFileSync('/home/shhwallet/wallet/ssh_keys/ssl.cert'),
    };

    var corsOptions = {
      origin: 'https://www.arunpanneerselvam.com',
      optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    }

    var https_port = process.env.PORT || 3030; //var port = process.env.PORT || 3030;

    var app         = express();            //express app
    console.log(app);
    app.set('superSecret', config.api['secret']); // Set API Secret

    app.use(bodyParser.urlencoded({ extended: false })); // use body parser to get info from POST and/or URL parameters
    app.use(bodyParser.json());

    app.use(morgan('dev')); // console logging using morgan

    app.use(cors()); //Use of cors for https origin issues
    app.disable('x-powered-by');
    /*
     * The SESSION
     */
    app.use(sessions({
      cookieName: 'shhAPIsessions', // cookie name dictates the key name added to the request object
      secret: config.api['secret'] , // should be a large unguessable string
      duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
      activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
        cookie: {
            path: '/api', // cookie will only be sent to requests under '/api'
            maxAge: 60000, // duration of the cookie in milliseconds, defaults to duration above
            ephemeral: false, // when true, cookie expires when the browser closes
            httpOnly: true, // when true, cookie is not accessible from javascript
            secure: true // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
        }
    }));

    app.use(sessions({
      cookieName: 'shhTradeSession', // cookie name dictates the key name added to the request object
      secret: config.api['secret'], // should be a large unguessable string
      duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
      activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
        cookie: {
            path: '/bitcoind', // cookie will only be sent to requests under '/api'
            maxAge: 60000, // duration of the cookie in milliseconds, defaults to duration above
            ephemeral: false, // when true, cookie expires when the browser closes
            httpOnly: true, // when true, cookie is not accessible from javascript
            secure: true // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
        }
    }));

    /**
     *  
     * @param {*} laravel Session Parser 
     * 
     * https://www.npmjs.com/package/laravel-session-parser
     * 
     */

    /*
     * Sample CodeIgniter Session parser
     */
     var sessionParser  = function(cookie) {
        exec('php session.php user_session decrypt ' + encodeURIComponent(cookie),
        function (error, stdout, stderr) {
            console.log(stdout);
            var parts = stdout.split(';');
            var session_id = parts[1].split(':')[2];
            /*var query = 'select * from sc_sessions where session_id=' + session_id;
            client.query(query, function (err, results, fields) {
                if (results) {
                    everyone.now.receiveMessage(str);
                }
            });*/
        });
     };
/*
    app.use(function(req, res, next) {
    console.log(req);
      if (req.shh_sessions.api_auth) {
        res.setHeader('X-SHH-API-Auth', 'true');
      } else {
        // setting a property will automatically cause a Set-Cookie response
        // to be sent
        req.shh_sessions.api_auth = true;
        res.setHeader('X-SHH-API-Auth', 'false');
      }
    });
*/
    /* --------------------------------------------------
     * connect to Mongo
     *
     * --------------------------------------------------
     */
    try {
        global.db = mongoose.connect(config.api.database); //- connect db in classic way
    }catch(err) { console.log(err);
        global.db = mongoose.createConnection(config.api.database); //- connect in modern mongo way
    }

    /* --------------------------------------------------
     *  Create the https server
     *
     * --------------------------------------------------
     */
    https.createServer(options, app).listen(https_port, function(){
        //if(err) console.log(err.toString());
      console.log("HTTPS server listening on port " + https_port);
    });





    /* --------------------------------------------------
     *  Basic Route
     *
     * --------------------------------------------------
     */

    app.get('/', function(req, res) {
        res.send('SHH Authorization HTTPS server at https://you.rip.com' + https_port + '/api');
    });

    /* --------------------------------------------------
     * Default user setup
     *
     * --------------------------------------------------
     */
    app.get('/setup', cors(corsOptions), function(req, res) {
        // create a sample user
        var admin = new User({
            name: 'aeroarunn',
            pass: 'sgpajsep2',
            acc_name: 'Arun Panneerselvam',
            acc_address: '3QDETgUuncyobgDaJgom9AmEiCDuR6NWzN',
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
        res.json({ success: true });
      });

    });


    /* --------------------------------------------------
     *  Request authorization through both GET & POST
     *
     * --------------------------------------------------
     */

    app.get('/' + config.api.auth_uri, cors(corsOptions), function (req, res) {  //console.log('Method: GET'); //through GET
        // IP Address of request
       var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
       var auth_secret  = req.query.client_secret || req.query.auth_secret  ;

        _authorize('/auth', req, res, ip, auth_secret);
    });

    app.post('/' + config.api.auth_uri, cors(corsOptions), function(req, res) {  //console.log('Method: POST'); //through POST

       var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
       var auth_secret  = req.body.client_secret || req.body.auth_secret  ;
       _authorize('/auth', req, res, ip, auth_secret);
    });


    // Function to call
    function _authorize(uri, req, res,  ip, auth_secret) {  //trough POST

        var id              = req.body.client_id || req.query.client_id ;
        var code            = req.body.code || req.query.code ;
        var ruri            = req.query['redirect_uri'] ||  req.body['redirect_uri'];
        var auth_type       = req.query['grant_type'] ||  req.body['grant_type'];
        var response_type   = req.query['response_type'] ||  req.body['response_type'];
        var token_type      = req.query['token_type'] || req.body['token_type'];
        var access_token    = req.query['access_token'] || req.body['access_token'];


        //Log the request
        var auth_log = new ReqLog({  u_id : req.query.client_id, when :  Date.now(), from : ip, });
        auth_log.save(function(err) { if (err) throw err; console.log('Request logged successfully');   });  //res.json({ success: true });

      User.findOne({  // find the user
            _id: id, //secret: req.query.secret, //redirect_uri: req.body.redirect_uri,
      }, function(err, user) {
            if (err)  console.log(err);
        if (!user) {

           res.format({
               'text/plain': function () {
                   res.send({success: false, message: 'Access denied, No such user!'});
               },
           });
        } else if (user) {
            //console.log(user);
          // check if client secret matches   //console.log(user.secret + " => " + auth_secret);
          if (user.secret !== auth_secret) {
             res.format({
               'text/plain': function () {
                   res.send({success: false, message: 'Access denied, invalid client secret!'});
               },
           });
          } else {
            // return the information including token as JSON

            res.setHeader("Access-Control-Allow-Origin", config.site.origin);
            res.setHeader("Access-Control-Allow-Methods", " GET, POST, PUT, DELETE");
            res.setHeader ("Content-Type", "application/json");
            // if user is found and password is right and code is received exchange token

              if (typeof user !== 'undefined'  && typeof auth_secret !== "undefined"  && auth_secret === user.secret && typeof code === "undefined" && response_type === "code") {  //satisfies Auth code requirements ?
                    var loc = ruri + '?code=' + config.api['secret'] ;
                      res.writeHead(302, { Location: loc, 'Set-Cookie': 'code=' + config.api['secret']  });
                      res.send();

              } else if(typeof user !== 'undefined' && typeof code !== "undefined" && code === config.api['secret'] && auth_type == "authorization_code") {   //All OK, send the token

                  var token = jwt.sign(user,  code,  {//app.get('superSecret'), {  //Generate token
                      expiresIn: config.api.auth_duration // expires in 5 seconds
                  });
                  console.log("sending access/refresh response...");
                  switch(token_type) {
                      case "refresh_token":    // do something here for refresh token
                      res.send({
                          success: true, grant_type: 'authorization_code',
                          message: 'Authorization expires in ' + config.api.auth_duration + ' seconds.',
                          refresh_token: token,
                          expires: config.api.auth_duration,
                      });
                      break;

                      default:    // It must be access token

                      res.send({
                          success: true, grant_type: 'authorization_code',
                          message: 'Authorization expires in ' + config.api.auth_duration + ' seconds.',
                          access_token: token,
                          expires: config.api.auth_duration,
                      });
                          res.end();
                  }

              } else if(typeof access_token !== 'undefined' && token_type === "refresh_token") {
                    res.send({
                          success: true, grant_type: 'authorization_code',
                          message: 'Authorization expires in ' + config.api.auth_duration + ' seconds.',
                          access_token: access_token,
                          expires: config.api.auth_duration,
                      });
              } else {
                  res.send({
                         success: false,// c: code, usertoken: user.token,
                         message : "Authentication error occurred. Please try again!",
                         error: 'Unknown error.',
                     });

              }

          }

        }

      });
    }

    /*
     *  View Log
     *  METHOD : GET
     */

    app.get('/logs', function(req, res) {
        ReqLog.find({}, function (err, log) {

            res.format({
                'text/plain': function () {   //res.send({success: false, message: 'Failed processing request, try again!'});
                    if (err) res.send({success: false, message: 'Failed processing request, try again!'});
                    else
                        //log.forEach(function(u) {u.pass = u.secret = u.token = 'forbidden'; });
                        res.send(JSON.stringify({success: true, message: "Request successful!" , data : log }));
                },
            });
        });
    });


    // apply the routes to our application with the prefix /api
    app.use('/api', apiRoutes);
    app.use('/bitcoind', btcRoutes);
    app.use('/trade', tradeRoutes);

    console.log('authorization server started at http://you.rip.address:' + https_port);
