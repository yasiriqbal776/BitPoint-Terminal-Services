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

var adminLoginRoute = router.route('/adminLogin');
var createMerchantRoute = router.route('/createMerchant');
var getMerchantListRoute = router.route('/getListOfMerchants');
var deleteMerchantRoute = router.route('/deleteMerchant');
var sendBalance = router.route('/sendBalance');
var withdrawFromHotWalletRoute = router.route('/withdrawFromHotWallet');

//BlocktrailSDK
var key = "778d7e774eed00fccc8009e49c1e4e8f70e7fc5d";
var secret = "4425b75f8e4699884742aa00f4419f0064123902";
var client = blocktrail.BlocktrailSDK({
    apiKey: key,
    apiSecret: secret,
    network: "BTC",
    testnet: false
});

// KRAKEN
var krakenKey = "kbHBa5jZ1dmBe53zuTg5drgGUI0Ee3O+vPnrlpNImzigAH7TsFzDwGbq"; // API Key
var krakenSecret = "4NuPL2wAzVoa4FrT29BFUgN8AqR3MxUBlM44xwoZKemaFWxkagux0U0TEU8yciygowqGvrGOZSMRCrxth8X9Aw=="; // API Private Key
var krakenClient = require('kraken-api');
var kraken = new krakenClient(krakenKey, krakenSecret);


//SOCKET
var apiurl = "https://blockexplorer.com/";
//var socket = require('socket.io-client')(apiurl);


var Password = require('./../utilities/Pass');
var Utility = require('./../utilities/UtilityFile');
var Response = require('./../utilities/response');
var ServerMessage = require('./../utilities/ServerMessages');
var PasscodeStatus = require('./../utilities/PasscodeStatuses');
var User = require('./../models/User');

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





adminLoginRoute.post(function (req, res) {
    var userName = req.body.userName;
    var userPassword = req.body.userPassword;
    User.findOne({ userName: userName }, function (err, user) {
        if (err) {
            console.log(err);
        }
        else {
            if (user != null) {
                var validate = password.validateHash(user.userPassword, req.body.userPassword);
                if (validate == true) {
                    var userObj = {};
                    userObj.userName = user.userName;
                    userObj.userEmail = user.userEmail;
                    userObj.userPassword = user.userPassword;
                    userObj._id = user._id;
                    userObj.authenticationToken = jwt.sign(userObj, "31TP01NT", { expiresIn: 60 * 60 * 24 });
                    response.message = "Success";
                    response.code = 200;
                    response.data = userObj;
                    res.json(response);
                }
                else {
                    response.message = "Invalid User Name or Password";
                    response.code = serverMessage.returnPasswordMissMatch();
                    response.data = null;
                    res.json(response);
                }
            }
            else {
                response.message = "User Does not Exist";
                response.code = serverMessage.returnPasswordMissMatch();
                response.data = null;
                res.json(response);
            }
        }
    });
});

createMerchantRoute.post(function (req, res) {
    var ethereumUser = new User();
    ethereumUser.userName = req.body.userName;
    ethereumUser.userEmail = req.body.userEmail;
    ethereumUser.userPassword = password.createHash(req.body.userPassword);
    ethereumUser.userFullName = req.body.userFullName;
    ethereumUser.userRole = req.body.userRole;
    ethereumUser.createdOnUTC = Math.floor(new Date());
    ethereumUser.updatedOnUTC = Math.floor(new Date());
    client.createNewWallet(ethereumUser.userName, ethereumUser.userPassword, function (err, wallet, backupInfo) {
        client.initWallet(ethereumUser.userName, ethereumUser.userPassword, function (err, wallet) {
            wallet.getNewAddress(function (err, address) {
                //global.addressArray.push(address);
                ethereumUser.userEthereumId = address;
                ethereumUser.save(function (err, ethereumUser) {
                    response.code = 200;
                    response.message = "Successfully Created";
                    response.data = ethereumUser;
                    res.json(response);
                });
            });
        });
    });
});

getMerchantListRoute.post(function (req, res) {
    EthereumUser.find({ userRole: 2 }, function (err, merchants) {
        if (err) {
            response.code = 400;
            response.message = "Error";
            response.data = err;
            res.json(response);
        }
        else {
            response.code = 200;
            response.message = "Success";
            response.data = merchants;
            res.json(response);
        }
    });
});

deleteMerchantRoute.post(function (req, res) {
    var merchantId = req.body._id;
    EthereumUser.findOne({ _id: merchantId }, function (err, merchant) {
        if (err) {
            response.code = 400;
            response.message = "Error";
            response.data = err;
            res.json(response);
        }
        else {
            if (merchant == null) {
                response.code = 500;
                response.message = "Merchant does not exist";
                response.data = null;
                res.json(response);
            }
            else {
                merchant.remove();
                response.code = 200;
                response.message = "Success";
                response.data = null;
                res.json(response);
            }
        }
    });
});

sendBalance.post(function (req, res) {
    var customerAddress = req.body.customerAddress;
    var amount = req.body.amount;
    var merchantUserName = req.body.merchantUserName;
    var merchantPassword = req.body.merchantPassword;
    User.findOne({ userName: merchantUserName }, function (err, ethereumUser) {
        client.address(ethereumUser.userEthereumId, function (err, address) {
            if (err)
                res.json(err);
            else {
                console.log(address);
                if (amount > address.balance) {
                    response.code = 275;
                    response.message = "Low balance";
                    response.data = address.balance;
                    console.log(response);
                    res.json(response);
                }
                else {
                    client.initWallet(ethereumUser.userName, ethereumUser.userPassword, function (err, wallet) {
                        amount = blocktrail.toSatoshi(amount);
                        console.log("Customer Address is" + customerAddress + "FINISHED");
                        console.log("Amount is " + amount);
                        console.log("Wallet is " + wallet);
                        var obj = {};
                        obj[customerAddress] = amount;
                        wallet.pay(obj, null, false, true, blocktrail.Wallet.FEE_STRATEGY_BASE_FEE, function (err, result) {
                            if (err) {
                                response.data = err;
                                response.message = "Could not Sent";
                                response.code = 280;
                                console.log("Error is " + err);
                                res.json(response);
                            }
                            else {
                                console.log("Result in paying to Customer Address from Wallet is"+result);
                                var krakenApi = require("kraken-api");
                                var krakenKey = "kbHBa5jZ1dmBe53zuTg5drgGUI0Ee3O+vPnrlpNImzigAH7TsFzDwGbq"; // API Key
                                var krakenSecret = "4NuPL2wAzVoa4FrT29BFUgN8AqR3MxUBlM44xwoZKemaFWxkagux0U0TEU8yciygowqGvrGOZSMRCrxth8X9Aw=="; // API Private Key
                                const KrakenClient = require('kraken-api');
                                const kraken = new KrakenClient(krakenKey, krakenSecret);
                                // Get Ticker Info
                                var sendingAmount = amount * 1.1;
                                var benificiaryKey = 'micheal';
                                console.log("Sending Amount is "+sendingAmount);
                                kraken.api('Withdraw', { asset: 'XXBT', key: benificiaryKey, amount: sendingAmount }, function (err, data) {
                                    if (err) {
                                        response.data = err.message;
                                        response.message = "Withdraw Error";
                                        response.code = 770;
                                        console.log(response);
                                        res.json(response);
                                    }
                                    else {
                                        //send 8%
                                        var objbtmOwnerProfit = {};
                                        var btmOwnerProfitAddress = "";
                                        objbtmOwnerProfit[btmOwnerProfitAddress] = sendingAmount*0.08;
                                        wallet.pay(objbtmOwnerProfit, null, false, true, blocktrail.Wallet.FEE_STRATEGY_BASE_FEE, function (err, result) {
                                        });
                                        //send 2%
                                        var bitpointProfitWallet="";
                                        var objbitpointProfit = {};
                                        var bitpointProfitAddress = "";
                                        objbitpointProfit[bitpointProfitAddress] = sendingAmount*0.02;
                                        wallet.pay(objbitpointProfit, null, false, true, blocktrail.Wallet.FEE_STRATEGY_BASE_FEE, function (err, result) {
                                            if(err)
                                            {
                                                response.data = err;
                                                response.message = "Failure in Sending to Bitpoint Profit Wallet";
                                                response.code = 245;
                                                res.json(response);
                                            }
                                            else
                                            {
                                                response.data = result;
                                                response.message = "Successfully Done Transfer to Sending to Bitpoint Profit Wallet";
                                                response.code = 200;
                                                res.json(response);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });
                } // End Else
            }
        });
    });
});

/*socket.on('connect', function () {
    // Join the room.
    socket.emit('subscribe', 'inv');
})
socket.on('tx', function (data) {
    var addresses = data.vout;
    for (var i = 0; i < addresses.length; i++) {
        var address = Object.keys(addresses[i])[0];
        var isExists = global.addressArray.find(x => x == address);
        var isExistsInInterimAccount = global.interimAccountArray.find(x => x == address);
        if (isExists !== undefined) {
            insertData(data, address, addresses[i]);
        }
        else if (isExistsInInterimAccount !== undefined) {
            inserDataInToInterimTransaction(data, address, addresses[i]);
        }
    }
});*/

function insertData(data, address) {
    // send 8% to 
    EthereumUser.findOne({ userEthereumId: address }, function (err, merchant) {
        client.initWallet(merchant.userName, merchant.userPassword, function (err, wallet) {
            // send 8% to ATM owner profit wallet
            // send 2% to bitpoint profit wallet
        });
    });
}

withdrawFromHotWalletRoute.post(function (req, res) {
    var krakenApi = require("kraken-api")

    var krakenKey = "kbHBa5jZ1dmBe53zuTg5drgGUI0Ee3O+vPnrlpNImzigAH7TsFzDwGbq"; // API Key
    var krakenSecret = "4NuPL2wAzVoa4FrT29BFUgN8AqR3MxUBlM44xwoZKemaFWxkagux0U0TEU8yciygowqGvrGOZSMRCrxth8X9Aw=="; // API Private Key
    const KrakenClient = require('kraken-api');
    const kraken = new KrakenClient(krakenKey, krakenSecret);

   /* (async () => {
        // Display user's balance
        console.log(await kraken.api('Balance'));

        // Get Ticker Info
        console.log(await kraken.api('Withdraw', { asset: 'XXBT', key: 'micheal', amount: 0.00130 }));
    })();*/
     kraken.api('Withdraw', { asset : 'XXBT',key : 'micheal',amount:0.002}, function(error, data) {
     if(error) {
         console.log(error);
         res.json(error.message);
     }
     else {
         console.log(data.result);
         res.json(data);
     }
 });
    /*kraken.api('Withdraw', { asset : 'XXBT',key : 'micheal',amount:0.0002},function(error, data) {
        if(error)
        {
            res.json(error);
        }
        else
        {
            res.json(data);
        }

    });*/
});

module.exports = router;