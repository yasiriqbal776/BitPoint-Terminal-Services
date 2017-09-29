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
var updateMinMaxBalanceRoute = router.route('/updateMinMaxBalance');
var updateUserPinRoute = router.route('/updateUserPin');
var updateHotWalletBenificiaryKeyRoute = router.route('/updateHotWalletBenificiaryKey');
var updateUserKrakenSetupRoute = router.route('/updateUserKrakenSetup');
var updateUserProfitThresholdSetupRoute = router.route('/updateUserProfitThresholdSetup');
var createMerchantProfitWalletRoute = router.route('/createMerchantProfitWallet');
var createBitPointProfitWalletRoute = router.route('/createBitPointProfitWallet');
var verifyMerchantPinRoute = router.route('/verifyMerchantPin');
var updateMerchantProfitRoute = router.route('/updateMerchantProfit');
var getTransactionDataRoute = router.route('/getTransactionData');

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
var AdminConfigurations = require('./../models/AdminConfigurations');

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
                    response.message = "Success";
                    response.code = 200;
                    response.data = user;
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
    ethereumUser.minimumHotWalletBalance = 0.25;
    ethereumUser.maximumHotWalletBalance = 0.50;
    console.log("USer Password for Wallet Creation is " + ethereumUser.userPassword);
    client.createNewWallet(ethereumUser.userName, ethereumUser.userPassword, function (err, wallet, backupInfo) {
        if (err) {
            console.log(err.message);
            console.log(err.code);
            response.code = err.code;
            response.message = err.message;
            res.json(response);
        }
        else {
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
        }
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
    console.log("Customer Address is " + customerAddress);
    var amount = req.body.amount;
    console.log("Amount is " + amount);
    var merchantUserName = req.body.merchantUserName;
    console.log("Merchant User Name is " + merchantUserName);
    User.findOne({ userName: merchantUserName }, function (err, ethereumUser) {
        if (ethereumUser == null) {
            response.data = null;
            response.message = "Merchant does not exist";
            response.code = 500;
            console.log(response);
            res.json(response);
        }
        else {
            client.address(ethereumUser.userEthereumId, function (err, address) {
                if (err)
                    res.json(err);
                else {
                    console.log("Customer address is ");
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
                            if (err) {
                                response.code = 295;
                                response.message = err.message;
                                response.data = err;
                                res.json(response);
                                console.log("Error in Initializing Wallet is ");
                                console.log(err);
                            }
                            else {
                                amount = blocktrail.toSatoshi(amount);
                                console.log("Amount in Satoshi is" + amount);
                                console.log("Customer Address is");
                                console.log(customerAddress);
                                console.log("Wallet is " + wallet);
                                console.log(wallet);
                                var obj = {};
                                obj[customerAddress] = amount;
                                wallet.pay(obj, null, false, true, blocktrail.Wallet.FEE_STRATEGY_BASE_FEE, function (err, result) {
                                    if (err) {
                                        response.data = err;
                                        response.message = "Could not Sent";
                                        response.code = 280;
                                        console.log("Error is Wallet paying is ");
                                        console.log(err);
                                        res.json(response);
                                    }
                                    else {
                                        console.log("Result in paying to Customer Address from Wallet is");
                                        console.log(result);
                                        var krakenApi = require("kraken-api");
                                        var krakenKey = "kbHBa5jZ1dmBe53zuTg5drgGUI0Ee3O+vPnrlpNImzigAH7TsFzDwGbq"; // API Key
                                        var krakenSecret = "4NuPL2wAzVoa4FrT29BFUgN8AqR3MxUBlM44xwoZKemaFWxkagux0U0TEU8yciygowqGvrGOZSMRCrxth8X9Aw=="; // API Private Key
                                        const KrakenClient = require('kraken-api');
                                        const kraken = new KrakenClient(krakenKey, krakenSecret);
                                        // Get Ticker Info
                                        var sendingAmount = amount * 1.1;
                                        console.log("Sending Amount is " + sendingAmount);
                                        if (address.balance < ethereumUser.minimumHotWalletBalance) {
                                            var sendingAmount = ethereumUser.maximumHotWalletBalance - address.balance;
                                            kraken.api('Withdraw', { asset: 'XXBT', key: ethereumUser.hotWalletBenificiaryKey, amount: sendingAmount }, function (err, data) {
                                                if (err) {
                                                    response.data = err.message;
                                                    response.message = "Withdraw Error";
                                                    response.code = 770;
                                                    console.log(response);
                                                    res.json(response);
                                                }
                                                else {

                                                }
                                            });
                                        }
                                        // For Profit Setup
                                        ethereumUser.merchantProfit += req.body.merchantProfit;
                                        if (ethereumUser.merchantProfit > ethereumUser.merchantProfitThreshold) {
                                            AdminConfigurations.findOne({}, function (err, adminConfiguration) {
                                                var merchantProfitToSend = ((ethereumUser.merchantProfit * adminConfiguration.merchantProfit) / 100);
                                                var btmProfitToSend = ((ethereumUser.merchantProfit * adminConfiguration.bitpointProfit) / 100);
                                                var newMerchantProfit = ethereumUser.merchantProfit;
                                                kraken.api('Withdraw', { asset: 'XXBT', key: ethereumUser.profitWalletKrakenBenificiaryKey, amount: merchantProfitToSend }, function (err, data) {
                                                    if (err) {
                                                        response.data = err.message;
                                                        response.message = "Error in Sending Profit to Merchant Profit Wallet";
                                                        response.code = 770;
                                                        console.log(response);
                                                        res.json(response);
                                                    }
                                                    else {

                                                    }
                                                });
                                                kraken.api('Withdraw', { asset: 'XXBT', key: ethereumUser.bitpointProfitWalletKrakenBenificiaryKey, amount: btmProfitToSend }, function (err, data) {
                                                    if (err) {
                                                        response.data = err.message;
                                                        response.message = "Error in Sending Profit to Merchant Profit Wallet";
                                                        response.code = 770;
                                                        console.log(response);
                                                        res.json(response);
                                                    }
                                                    else {
                                                    }
                                                });
                                                ethereumUser.merchantProfit = 0;
                                                ethereumUser.save(function (err, ethereumUser) {

                                                });
                                            });
                                        }
                                        else {
                                            ethereumUser.save(function (err, ethereumUser) {

                                            });
                                        }
                                        //Profit Setup ends here
                                    }
                                });
                            }
                        });
                    } // End Else
                }
            });
        }
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
    kraken.api('Withdraw', { asset: 'XXBT', key: 'micheal', amount: 0.002 }, function (error, data) {
        if (error) {
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

updateMinMaxBalanceRoute.post(function (req, res) {
    User.findOne({ _id: req.body.merchantId }, function (err, merchant) {
        if (merchant == null) {
            response.data = null;
            response.message = "Merchant does not exist";
            response.code = 500;
            console.log(response);
            res.json(response);
        }
        else {
            merchant.minimumHotWalletBalance = req.body.minimumHotWalletBalance;
            merchant.maximumHotWalletBalance = req.body.maximumHotWalletBalance;
            merchant.save(function (err, merchant) {
                response.data = merchant;
                response.message = "Success";
                response.code = 200;
                console.log(response);
                res.json(response);
            });
        }
    });
});

updateUserPinRoute.post(function (req, res) {
    User.findOne({ _id: req.body.merchantId }, function (err, merchant) {
        if (merchant == null) {
            response.data = null;
            response.message = "Merchant does not exist";
            response.code = 500;
            console.log(response);
            res.json(response);
        }
        else {
            merchant.ethereumUserPasscode = req.body.UserPasscode;
            merchant.save(function (err, merchant) {
                response.data = merchant;
                response.message = "Success";
                response.code = 200;
                console.log(response);
                res.json(response);
            });
        }
    });
});

updateHotWalletBenificiaryKeyRoute.post(function (req, res) {
    User.findOne({ _id: req.body.merchantId }, function (err, merchant) {
        if (merchant == null) {
            response.data = null;
            response.message = "Merchant does not exist";
            response.code = 500;
            console.log(response);
            res.json(response);
        }
        else {
            merchant.hotWalletBenificiaryKey = req.body.hotWalletBenificiaryKey;
            merchant.save(function (err, merchant) {
                response.data = merchant;
                response.message = "Success";
                response.code = 200;
                console.log(response);
                res.json(response);
            });
        }
    });
});

updateUserKrakenSetupRoute.post(function (req, res) {
    User.findOne({ _id: req.body.merchantId }, function (err, merchant) {
        if (merchant == null) {
            response.data = null;
            response.message = "Merchant does not exist";
            response.code = 500;
            console.log(response);
            res.json(response);
        }
        else {
            merchant.krakenAPIKey = req.body.krakenAPIKey;
            merchant.krakenAPISecret = req.body.krakenAPISecret;
            merchant.save(function (err, merchant) {
                response.data = merchant;
                response.message = "Success";
                response.code = 200;
                console.log(response);
                res.json(response);
            });
        }
    });
});

updateUserProfitThresholdSetupRoute.post(function (req, res) {
    User.findOne({ _id: req.body.merchantId }, function (err, merchant) {
        if (merchant == null) {
            response.data = null;
            response.message = "Merchant does not exist";
            response.code = 500;
            console.log(response);
            res.json(response);
        }
        else {
            merchant.merchantProfitThreshold = req.body.merchantProfitThreshold;
            merchant.save(function (err, merchant) {
                response.data = merchant;
                response.message = "Success";
                response.code = 200;
                console.log(response);
                res.json(response);
            });
        }
    });
});

createMerchantProfitWalletRoute.post(function (req, res) {
    User.findOne({ _id: req.body.merchantId }, function (err, merchant) {
        if (merchant == null) {
            response.data = null;
            response.message = "Merchant does not exist";
            response.code = 500;
            console.log(response);
            res.json(response);
        }
        else {
            if (req.body.createNewProfitWallet == 1) {
                client.createNewWallet(req.body.profitWalletUserName, req.body.profitWalletUserPassword, function (err, wallet, backupInfo) {
                    if (err) {
                        console.log(err.message);
                        console.log(err.code);
                        response.code = err.code;
                        response.message = err.message;
                        res.json(response);
                    }
                    else {
                        client.initWallet(req.body.profitWalletUserName, req.body.profitWalletUserPassword, function (err, wallet) {
                            if (err) {
                                console.log(err.message);
                                console.log(err.code);
                                response.code = err.code;
                                response.message = err.message;
                                res.json(response);
                            }
                            else {
                                wallet.getNewAddress(function (err, address) {
                                    //global.addressArray.push(address);
                                    merchant.profitWalletAddress = address;
                                    merchant.save(function (err, merchant) {
                                        response.code = 200;
                                        response.message = "Successfully Created";
                                        response.data = merchant;
                                        res.json(response);
                                    });
                                });
                            }
                        });
                    }
                });
            }
            else {
                if (req.body.profitWalletAddress != "") {
                    merchant.profitWalletAddress = req.body.profitWalletAddress;
                }
                if (req.body.profitWalletKrakenBenificiaryKey != "") {
                    var krakenKey = merchant.krakenAPIKey;
                    var krakenSecret = merchant.krakenAPISecret;
                    const KrakenClient = require('kraken-api');
                    const kraken = new KrakenClient(krakenKey, krakenSecret);
                    kraken.api('Withdraw', { asset: 'XXBT', key: req.body.profitWalletKrakenBenificiaryKey, amount: 0.0001 }, function (error, data) {
                        if (error) {
                            response.code = 407;
                            response.message = error.message;
                            response.data = null;
                            res.json(response);
                            console.log(response);
                            console.log("Code is " + error.Code);
                            console.log("Message is " + error.message);
                        }
                        else {
                            console.log("Data is");
                            console.log(data);
                            console.log("Data.Result is");
                            console.log(data.result);
                            merchant.profitWalletKrakenBenificiaryKey = req.body.profitWalletKrakenBenificiaryKey;
                            merchant.save(function (err, merchant) {
                                if (error) {
                                    response.code = 200;
                                    response.message = "Success";
                                    response.data = merchant;
                                    res.json(response);
                                    console.log(response);
                                }
                            })
                        }
                    });
                }
            }
        }
    });
});

createBitPointProfitWalletRoute.post(function (req, res) {
    User.findOne({ _id: req.body.merchantId }, function (err, merchant) {
        if (merchant == null) {
            response.data = null;
            response.message = "Merchant does not exist";
            response.code = 500;
            console.log(response);
            res.json(response);
        }
        else {
            if (req.body.bitpointProfitWalletAddress != "") {
                merchant.bitpointProfitWalletAddress = req.body.bitpointProfitWalletAddress;
            }
            if (req.body.bitpointProfitWalletKrakenBenificiaryKey != "") {
                var krakenKey = merchant.krakenAPIKey;
                var krakenSecret = merchant.krakenAPISecret;
                const KrakenClient = require('kraken-api');
                const kraken = new KrakenClient(krakenKey, krakenSecret);
                kraken.api('Withdraw', { asset: 'XXBT', key: req.body.bitpointProfitWalletKrakenBenificiaryKey, amount: 0.0001 }, function (error, data) {
                    if (error) {
                        response.code = 407;
                        response.message = error.message;
                        response.data = null;
                        res.json(response);
                        console.log(response);
                        console.log("Code is " + error.Code);
                        console.log("Message is " + error.message);
                    }
                    else {
                        console.log("Data is");
                        console.log(data);
                        console.log("Data.Result is");
                        console.log(data.result);
                        merchant.bitpointProfitWalletKrakenBenificiaryKey = req.body.bitpointProfitWalletKrakenBenificiaryKey;
                        merchant.save(function (err, merchant) {
                            if (error) {
                                response.code = 200;
                                response.message = "Success";
                                response.data = merchant;
                                res.json(response);
                                console.log(response);
                            }
                        })
                    }
                });
            }
        }
    });
});

verifyMerchantPinRoute.post(function (req, res) {
    User.findOne({ _id: req.body.merchantId }, function (err, merchant) {
        if (merchant == null) {
            response.data = null;
            response.message = "Merchant does not exist";
            response.code = 500;
            console.log(response);
            res.json(response);
        }
        else {
            if (merchant.ethereumUserPasscode == req.body.UserPasscode) {
                response.message = "Success";
                response.code = 200;
                response.data = merchant;
            }
            else {
                response.message = "Invalid Pin";
                response.code = 205;
                response.data = null;
            }
        }
    });
});

updateMerchantProfitRoute.post(function (req, res) {
    User.findOne({ _id: req.body.merchantId }, function (err, merchant) {
        if (merchant == null) {
            response.data = null;
            response.message = "Merchant does not exist";
            response.code = 500;
            console.log(response);
            res.json(response);
        }
        else {
            merchant.merchantProfitMargin = req.body.merchantProfitMargin;
            merchant.save(function (err, merchant) {
                response.data = merchant;
                response.message = "Success";
                response.code = 200;
                console.log(response);
                res.json(response);
            });
        }
    });
});

getTransactionDataRoute.post(function (req, res) {
    var transactionId = req.body.transactionId;
    console.log("Transaction Id is " + transactionId);
    client.transaction(transactionId, function (err, trx) {
        if (err) {
            response.data = err;
            response.code = 199;
            response.message = "Error in Getting Transaction";
            res.json(response);
            console.log("Error is " + err);
        }
        else {
            response.data = trx;
            response.code = 200;
            response.message = "Success";
            res.json(response);
            console.log("Error is " + err);
        }
    });
});

module.exports = router;