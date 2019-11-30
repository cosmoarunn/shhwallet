
/*
 *  routes.js
 *  Package: shhwallet
 *
 *  Description : Server Routes..
 *  Author: Arun Panneerselvam
 *  email: aeroarunn@live.com
 *  website: arunpanneerselvam.com
 */
const config    = require( "./config.js"  );
var path        = require('path');
var express     = require('express');
var User        = require('../model/user.js'); // get  mongoose user model
var rlog        = require('../model/requests.js'); //get req logger model
var apiRoutes   = express.Router();
var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var ReqLog      = require('../model/requests.js');
var views       = '/views/';
var fs          = require('fs');

global.appRootPath  = path.resolve(__dirname).replace('/scripts', '/');
global.scriptPath   = path.resolve(__dirname);
global.viewPath     = appRootPath + 'views/';

console.log(viewPath + "about.html");
/*
 *  API Routes
 *  Welcome message (GET http://localhost:port/api/)
 *  Method : GET
 */



/*
 *
 *  Verify authentication token
 */
apiRoutes.use(function(req, res, next) {

    //console.log(req.query);

    var token = req.body.token || req.query.token || req.headers['x-access-token'];

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

apiRoutes.get('/', function(req, res) {
    //res.sendFile(path.join(__dirname, '../views/', 'about.html'));
    //var file = fs.readFileSync(viewPath + "about.html");
    console.log(path.join(__dirname, '../views/', 'about.html'));
     res.format({
         'text/html': function () {
                res.sendFile(path.join(__dirname, '../views/', 'about.html'));
             },



     });


});

/*
 * return all api users as JSON object (GET http://localhost:port/api/users)
 * Method : GET
 */
apiRoutes.get('/users', function(req, res) {
    User.find({}, function (err, users) {
        res.format({
            'text/plain': function () {   //res.send({success: false, message: 'Failed processing request, try again!'});
                if (err) res.send({success: false, message: 'Failed processing request, try again!'});
                else
                    users.forEach(function(u) { u.pass = u.token = 'forbidden'; });
                    res.json({ 'users' : users });
            },
        });
    });
});

/*
 * return all api users as JSON object (GET http://localhost:port/api/users)
 * Method : GET
 */
apiRoutes.get('/userinfo', function(req, res) {

     console.log('userinfo requested....');
var uname = req.query.name || req.body.name;
var pass  = req.query.pass || req.body.pass;
    console.log({ name : uname, pass : pass});
    User.find({ name : uname, pass : pass }, function (err, user){

        res.format({
            'text/plain': function () {   //res.send({success: false, message: 'Failed processing request, try again!'});
                if (err) res.send({success: false, message: 'Failed processing request, try again!'});
                else
                    //user.forEach(function(u) {   }); // u.pass = u.secret = u.token = 'forbidden'; });
                    console.log(user);
                    res.send({data : user[0] });
            },
        });
    });
});

/*
 * Delete API User
 */
apiRoutes.get('/deleteuser', function(req, res){

    User.findByIdAndRemove({ _id : req.query.id}, function (err, message){
        if(err) { res.json({ 'message': err}); }
        else    { res.json({ 'message': message }); }
    });
});


/*
 * USER Local Trade API
 */
apiRoutes.get('/trade', function(req, res) {



});




module.exports = apiRoutes;