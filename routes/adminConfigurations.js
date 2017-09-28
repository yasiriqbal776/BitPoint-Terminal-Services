var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');

var Client = require('node-rest-client').Client;
var jwt = require('jsonwebtoken');

var User = require('./../models/User');
var blocktrail = require('blocktrail-sdk');

var multipartMiddleware = multipart();

var addProfitConfigurationRoute = router.route('/addProfitConfiguration');

var Password = require('./../utilities/Pass');
var Utility = require('./../utilities/UtilityFile');
var Response = require('./../utilities/response');
var ServerMessage = require('./../utilities/ServerMessages');
var PasscodeStatus = require('./../utilities/PasscodeStatuses');
var User = require('./../models/User');
var AdminConfiguration = require('./../models/AdminConfigurations');

var utility = new Utility({});

var password = new Password({});

var response = new Response({

});

var serverMessage = new ServerMessage({

});

var passcodeStatus = new PasscodeStatus({

});

// Connection URL. This is where your mongodb server is running.

var url = utility.getURL();

//mongoose.createConnection(url, function (err, db) {
mongoose.connect(url, function (err, db) {
    if (err) {
        console.log(err);
    } else {
        console.log("Successfully Connected");
    }
});

addProfitConfigurationRoute.post(function (req, res) {
    AdminConfiguration.findOne({}, function (err, adminConfiguration) {
        if (err) {
            console.log(err);
            res.json(err);
        }
        else {
            if(adminConfiguration==null)
            {
                adminConfiguration = new AdminConfiguration();
            }
            adminConfiguration.merchantProfit = req.body.merchantProfit;
            adminConfiguration.bitpointProfit = req.body.bitpointProfit;
            adminConfiguration.save(function(err,adminConfiguration){
                response.data = adminConfiguration;
                response.code = 200;
                response.message = "Success";
                res.json(response);
            });
        }
    });
});

module.exports = router;