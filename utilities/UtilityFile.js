/**
 * Created by Tauqeer on 15-08-2016.
 */

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Client = require('node-rest-client').Client;
var blocktrail = require('blocktrail-sdk');

/**
 * FCM (Firebase Cloud Messaging)
 */
var FCM = require('fcm-node');
var serverKey = 'AIzaSyBVH9t5do-_1NFJLKpBIM1HxJzCWS8dHMc'; //put your server key here 
var fcm = new FCM(serverKey);
var fcmIdFromUser="";
/**
 * End
 */


var UtilityFile = function Constructor() {

};


UtilityFile.prototype.getURL = function () {
    // Connection URL. This is where your mongodb server is running.
    //var url = 'mongodb://localhost:27017/HRMS';
    //var url = 'mongodb://bitpointadmin:bitpoint123@ds161950.mlab.com:61950/bitpointdb';
    var url = 'mongodb://bpterminal:bpterminal@ds125578.mlab.com';
    return url;
};

UtilityFile.prototype.validateEmail = function (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

UtilityFile.prototype.checkIfElementExistsInArray = function (numberArray, number) {
    for (var iNumberCount = 0; iNumberCount < numberArray.length; iNumberCount++) {
        console.log("Num:" + number);
        console.log("Doosra Num" + numberArray[iNumberCount].userContactNumber);
        if (numberArray[iNumberCount].userContactNumber === number) {
            console.log("yes");
            var obj = new Object();
            obj.id = numberArray[iNumberCount]._id;
            obj.number = numberArray[iNumberCount].userContactNumber;
            obj.userBitcoinPublicKey = numberArray[iNumberCount].ethAddress;
            return obj;
        }
    }
    return null;
}

UtilityFile.prototype.sendGCM = function () {
    var client = new Client();
    var http = require("http");
    var options = {
        host: 'https://fcm.googleapis.com',
        path: '/fcm/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'key = AIzaSyBVH9t5do-_1NFJLKpBIM1HxJzCWS8dHMc'

        }
    };
    var req = http.request(options, function (res) {
        console.log('Status: ' + res.statusCode);
        console.log('Headers: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (body) {
            console.log('Body: ' + body);
        });
    });
    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });
    // write data to request body
    req.write('{"string": "Hello, World"}');
    req.end();
}

/**
 * Sending Push Notification through FCM
 */
UtilityFile.prototype.sendPushNotificationMessage = function (fcmId, transactionObject, userName, amount, _id) {
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera) 
        to: fcmId,

        data: {  //you can send only notification or only data(or include both) 
            message: "You Recieved " + amount + " bitcoins (BTC) from " + userName,
            data: _id,
            type: "transaction",
            amount: amount
        }
    };
    console.log(message);
    console.log("FCM Sending");
    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response)
        }
    });
};
/**
 * END
 */

/**
* Sending Push Notification through FCM
*/
UtilityFile.prototype.sendTransactionReceivedNotificationMessage = function (fcmId,amount,transactionId) {
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera) 
        to: fcmId,
        data: {  //you can send only notification or only data(or include both) 
            message: "You Recieved  bitcoins (BTC)",
            amount:amount,
            txId:transactionId,
            type: "transactionConfirmed"
        }
    };
    console.log("Data is ");
    console.log(message);
    console.log("FCM Sending");
    console.log("FCM ID is "+fcmId);
    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response)
        }
    });
};

UtilityFile.prototype.sendTransactionUnConfirmedNotificationMessage = function (fcmId,txId,amount) {
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera) 
        to: fcmId,
        data: {  //you can send only notification or only data(or include both) 
            message: "You Recieved  bitcoins (BTC)",
            type: "transactionUnConfirmed",
            txId:txId,
            amount:amount
        }
    };
    console.log("Data is ");
    console.log(message);
    console.log("FCM Sending");
    console.log("FCM ID is "+fcmId);
    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!");
            console.log(err);
        } else {
            console.log("Successfully sent with response: ", response)
        }
    });
};
/**
 * END
 */


UtilityFile.prototype.transactionListener = function (fcmId, userBtcId) {
    //BlocktrailSDK
    var key = "778d7e774eed00fccc8009e49c1e4e8f70e7fc5d";
    var secret = "4425b75f8e4699884742aa00f4419f0064123902";
    var client = blocktrail.BlocktrailSDK({
        apiKey: key,
        apiSecret: secret,
        network: "BTC",
        testnet: false
    });
    fcmIdFromUser = fcmId;
    console.log("Listner Function is called");
    client.setupWebhook('http://35.189.115.14',
    function(err, result) {
        client.subscribeAddressTransactions(result.identifier,
        userBtcId, 1, function (err, result) {
            console.log("FCM ID is "+fcmIdFromUser);
            console.log("Response Received is ");
            console.log("User Address is "+userBtcId);
            console.log("Result is ");
            console.log(result);
            //sendTransactionReceivedNotificationMessage(fcmId, result);
        });
    });
};

module.exports = UtilityFile;

