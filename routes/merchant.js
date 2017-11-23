var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var asyncLoop = require('node-async-loop');

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
var receiveBalance = router.route('/receiveBalance');
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
var getTransactionsByMerchantIdRoute = router.route('/getTransactionsByMerchantId');
var getTransactionStatisticsByTimeRoute = router.route('/getTransactionStatisticsByTimeRoute');
var getProfitStatisticsByTimeRoute = router.route('/getProfitStatisticsByTime');
var attachListenerRoute = router.route('/attachListener');
var postSaveSenderAddressRoute = router.route('/postSaveSenderAddress');
var postUpdateLatLongRoute = router.route('/postUpdateLatLong');
var getTestTransactionDataRoute = router.route('/getTestTransactionData');
var postUpdateUseKrakenRoute = router.route('/updateUseKraken');
//BlocktrailSDK
var key = "778d7e774eed00fccc8009e49c1e4e8f70e7fc5d";
var secret = "4425b75f8e4699884742aa00f4419f0064123902";
var client = blocktrail.BlocktrailSDK({
    apiKey: key,
    apiSecret: secret,
    network: "BTC",
    testnet: false
});

// web client
var webClient = new Client();
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
var Transaction = require('./../models/Transaction');
var Profit = require('./../models/Profit');
var ReceiverBalance = require('./../models/ReceiverBalance');

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
    ethereumUser.userFullName = req.body.userName;
    ethereumUser.userRole = req.body.userRole;
    ethereumUser.createdOnUTC = Math.floor(new Date());
    ethereumUser.updatedOnUTC = Math.floor(new Date());
    ethereumUser.minimumHotWalletBalance = 0.25;
    ethereumUser.maximumHotWalletBalance = 0.50;
    ethereumUser.merchantProfit = 0;
    ethereumUser.merchantProfitMargin = 10;
    ethereumUser.useKraken = false;
    console.log("USer Password for Wallet Creation is " + ethereumUser.userPassword);
    client.createNewWallet(ethereumUser.userName, ethereumUser.userPassword, function (err, wallet, backupInfo) {
        console.log("Wallet ");
        console.log(wallet);
        console.log("BackupInfo");
        console.log(backupInfo);
        if (err) {
            console.log(err.message);
            console.log(err.code);
            response.code = err.code;
            response.message = err.message;
            res.json(response);
        }
        else {
            client.initWallet(ethereumUser.userName, ethereumUser.userPassword, function (err, wallet) {
                console.log("wallet after Initializing ");
                console.log(wallet);
                wallet.getNewAddress(function (err, address) {
                    console.log("Address");
                    console.log(address);
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
    User.find({ userRole: 2 }, function (err, merchants) {
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
    User.findOne({ _id: merchantId }, function (err, merchant) {
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
    var amountToSend = blocktrail.toSatoshi(amount);
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
                if (err) {
                    response.data = null;
                    response.message = "Error in Getting Address";
                    response.code = 505;
                    res.json(err);
                }
                else {
                    console.log("Customer address is ");
                    console.log(address);
                    var hotWalletBalance = address.balance - amountToSend;
                    console.log("How Wallet Balance will be " + hotWalletBalance);
                    if (amountToSend > address.balance) {
                        console.log("Customer balance is " + address.balance);
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
                                console.log("Amount in Satoshi is" + amountToSend);
                                console.log("Customer Address is");
                                console.log(customerAddress);
                                console.log("Wallet is " + wallet);
                                console.log(wallet);
                                var obj = {};
                                obj[customerAddress] = amountToSend;
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
                                        var krakenKey = ethereumUser.krakenAPIKey;
                                        var krakenSecret = ethereumUser.krakenAPISecret;
                                        const KrakenClient = require('kraken-api');
                                        const kraken = new KrakenClient(krakenKey, krakenSecret);
                                        var transaction = new Transaction();
                                        transaction.merchantId = ethereumUser._id;
                                        transaction.customerAddress = customerAddress;
                                        transaction.sendingAmount = amount;
                                        transaction.transactionType = "SELL";
                                        transaction.transactionId = result;
                                        transaction.transactionTime = Math.floor(new Date());
                                        transaction.save();
                                        response.data = result;
                                        response.code = 200;
                                        response.message = "Success";
                                        res.json(response);
                                        // Profit ENTRY
                                        var profit = new Profit();
                                        profit.merchantId = ethereumUser._id;
                                        profit.customerAddress = customerAddress;
                                        profit.profitTotal = req.body.merchantProfit;
                                        profit.transactionId = result;
                                        profit.profitTime = Math.floor(new Date());
                                        profit.profitType = "SELL";
                                        profit.save();
                                        // 
                                        if (hotWalletBalance < ethereumUser.minimumHotWalletBalance) {
                                            var sendingAmount = ethereumUser.maximumHotWalletBalance - hotWalletBalance;
                                            if (ethereumUser.useKraken == true) {
                                                kraken.api('Withdraw', { asset: 'XXBT', key: ethereumUser.hotWalletBenificiaryKey, amount: sendingAmount }, function (err, data) {
                                                    if (err) {
                                                        response.data = err.message;
                                                        response.message = "Withdraw Error";
                                                        response.code = 770;
                                                        console.log(response);
                                                    }
                                                    else {
                                                        response.data = data;
                                                        response.message = "Sent in Customer Hot Wallet from Kraken";
                                                        response.code = 200;
                                                        console.log(response);
                                                    }
                                                });
                                            }
                                        }
                                        // For Profit Setup
                                        console.log("Mechant Profit before Add up is " + ethereumUser.merchantProfit);
                                        console.log("Merchant Profit from request is " + req.body.merchantProfit);
                                        ethereumUser.merchantProfit += req.body.merchantProfit;
                                        console.log("Mechant Profit after Add up is " + ethereumUser.merchantProfit);
                                        if (ethereumUser.merchantProfit > ethereumUser.merchantProfitThreshold) {
                                            AdminConfigurations.findOne({}, function (err, adminConfiguration) {
                                                var merchantProfitToSend = ((ethereumUser.merchantProfit * adminConfiguration.merchantProfit) / 100);
                                                console.log("Profit to send to Merchant is " + merchantProfitToSend);
                                                var btmProfitToSend = ((ethereumUser.merchantProfit * adminConfiguration.bitpointProfit) / 100);
                                                console.log("Profit to send to BTM WALLET is " + btmProfitToSend);
                                                var newMerchantProfit = ethereumUser.merchantProfit;
                                                if (ethereumUser.useKraken == true) {
                                                    kraken.api('Withdraw', { asset: 'XXBT', key: ethereumUser.profitWalletKrakenBenificiaryKey, amount: merchantProfitToSend }, function (err, data) {
                                                        if (err) {
                                                            response.data = err.message;
                                                            response.message = "Error in Sending Profit to Merchant Profit Wallet";
                                                            response.code = 770;
                                                            console.log(response);
                                                        }
                                                        else {
                                                            response.data = data;
                                                            response.message = "Sent to Profit Wallet from Kraken";
                                                            response.code = 200;
                                                            console.log(response);
                                                        }
                                                    });
                                                    kraken.api('Withdraw', { asset: 'XXBT', key: ethereumUser.bitpointProfitWalletKrakenBenificiaryKey, amount: btmProfitToSend }, function (err, data) {
                                                        if (err) {
                                                            response.data = err.message;
                                                            response.message = "Error in Sending Profit to BTM Profit Wallet";
                                                            response.code = 770;
                                                            console.log(response);
                                                        }
                                                        else {
                                                            response.data = data;
                                                            response.message = "Sent in BTM Profit Wallet from Kraken";
                                                            response.code = 200;
                                                            console.log(response);
                                                        }
                                                    });
                                                }
                                                else {
                                                    var objSendProfitToMerchant = {};
                                                    objSendProfitToMerchant[ethereumUser.profitWalletAddress] = blocktrail.toSatoshi(merchantProfitToSend);
                                                    wallet.pay(objSendProfitToMerchant, null, false, true, blocktrail.Wallet.FEE_STRATEGY_BASE_FEE, function (err, result) {
                                                        if (err) {
                                                            response.data = err.message;
                                                            response.message = "Error in Sending Profit to Merchant Profit Wallet";
                                                            response.code = 770;
                                                            console.log(response);
                                                        }
                                                        else {
                                                            response.data = result;
                                                            response.message = "Sent to Profit Wallet from BlockTrail";
                                                            response.code = 200;
                                                            console.log(response);
                                                        }
                                                    });

                                                    var objSendProfitToBitpointProfitWallet = {};
                                                    objSendProfitToBitpointProfitWallet[ethereumUser.bitpointProfitWalletAddress] = blocktrail.toSatoshi(btmProfitToSend);
                                                    wallet.pay(objSendProfitToBitpointProfitWallet, null, false, true, blocktrail.Wallet.FEE_STRATEGY_BASE_FEE, function (err, result) {
                                                        if (err) {
                                                            response.data = err.message;
                                                            response.message = "Error in Sending Profit to Bitpoint Profit Wallet";
                                                            response.code = 770;
                                                            console.log(response);
                                                        }
                                                        else {
                                                            response.data = result;
                                                            response.message = "Sent to Bitpoint Profit Wallet from BlockTrail";
                                                            response.code = 200;
                                                            console.log(response);
                                                        }
                                                    });
                                                }
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

receiveBalance.post(function (req, res) {
    var customerAddress = req.body.customerAddress;
    var walletName = req.body.walletName;
    var walletPassword = req.body.walletPassword;
    console.log("Customer Address is " + customerAddress);
    var amount = req.body.amount;
    var amountToSend = blocktrail.toSatoshi(amount);
    console.log("Amount is " + amount);
    console.log("Amount in Satoshi is " + amountToSend);
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
            client.address(customerAddress, function (err, address) {
                if (err) {
                    response.data = null;
                    response.message = "Error in Getting Address";
                    response.code = 505;
                    console.log("Error in Getting Address");
                    console.log(err);
                    res.json(err);
                }
                else {
                    console.log("Customer address is ");
                    console.log(address);
                    console.log("Customer balance is " + address.balance);
                    if (amountToSend > address.balance) {
                        console.log("Customer balance is " + address.balance);
                        response.code = 275;
                        response.message = "Low balance";
                        response.data = address.balance;
                        console.log(response);
                        res.json(response);
                    }
                    else {
                        client.initWallet(walletName, walletPassword, function (err, wallet) {
                            if (err) {
                                response.code = 295;
                                response.message = err.message;
                                response.data = err;
                                res.json(response);
                                console.log("Error in Initializing Wallet is ");
                                console.log(err);
                            }
                            else {
                                console.log("Amount in Satoshi is" + amountToSend);
                                console.log("Customer Address is");
                                console.log(customerAddress);
                                console.log("Wallet is " + wallet);
                                console.log(wallet);
                                var obj = {};
                                obj[ethereumUser.userEthereumId] = amountToSend;
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
                                        console.log("Result in paying to Hot Wallet Address from Customer is");
                                        console.log(result);
                                        var krakenApi = require("kraken-api");
                                        var krakenKey = ethereumUser.krakenAPIKey;
                                        var krakenSecret = ethereumUser.krakenAPISecret;
                                        const KrakenClient = require('kraken-api');
                                        const kraken = new KrakenClient(krakenKey, krakenSecret);
                                        var transaction = new Transaction();
                                        transaction.merchantId = ethereumUser._id;
                                        transaction.customerAddress = customerAddress;
                                        transaction.sendingAmount = amount;
                                        transaction.transactionType = "BUY";
                                        transaction.transactionId = result;
                                        transaction.transactionTime = Math.floor(new Date());
                                        transaction.save();
                                        response.data = result;
                                        response.code = 200;
                                        response.message = "Success";
                                        res.json(response);
                                        // For Profit Setup
                                        console.log("Mechant Profit before Add up is " + ethereumUser.merchantProfit);
                                        console.log("Merchant Profit from request is " + req.body.merchantProfit);
                                        ethereumUser.merchantProfit += req.body.merchantProfit;
                                        // Profit ENTRY
                                        var profit = new Profit();
                                        profit.merchantId = ethereumUser._id;
                                        profit.customerAddress = customerAddress;
                                        profit.profitTotal = req.body.merchantProfit;
                                        profit.transactionId = result;
                                        profit.profitTime = Math.floor(new Date());
                                        profit.profitType = "BUY";
                                        profit.save();
                                        // 
                                        console.log("Mechant Profit after Add up is " + ethereumUser.merchantProfit);
                                        if (ethereumUser.merchantProfit > ethereumUser.merchantProfitThreshold) {
                                            AdminConfigurations.findOne({}, function (err, adminConfiguration) {
                                                var merchantProfitToSend = ((ethereumUser.merchantProfit * adminConfiguration.merchantProfit) / 100);
                                                console.log("Profit to send to Merchant is " + merchantProfitToSend);
                                                var btmProfitToSend = ((ethereumUser.merchantProfit * adminConfiguration.bitpointProfit) / 100);
                                                console.log("Profit to send to BTM WALLET is " + btmProfitToSend);
                                                var newMerchantProfit = ethereumUser.merchantProfit;
                                                kraken.api('Withdraw', { asset: 'XXBT', key: ethereumUser.profitWalletKrakenBenificiaryKey, amount: merchantProfitToSend }, function (err, data) {
                                                    if (err) {
                                                        response.data = err.message;
                                                        response.message = "Error in Sending Profit to Merchant Profit Wallet";
                                                        response.code = 770;
                                                        console.log(response);
                                                    }
                                                    else {
                                                        response.data = data;
                                                        response.message = "Sent to Profit Wallet from Kraken";
                                                        response.code = 200;
                                                        console.log(response);
                                                    }
                                                });
                                                kraken.api('Withdraw', { asset: 'XXBT', key: ethereumUser.bitpointProfitWalletKrakenBenificiaryKey, amount: btmProfitToSend }, function (err, data) {
                                                    if (err) {
                                                        response.data = err.message;
                                                        response.message = "Error in Sending Profit to BTM Profit Wallet";
                                                        response.code = 770;
                                                        console.log(response);
                                                    }
                                                    else {
                                                        response.data = data;
                                                        response.message = "Sent in BTM Profit Wallet from Kraken";
                                                        response.code = 200;
                                                        console.log(response);
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
                    }
                }
            });
        }
    });
});

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
                        console.log(response);
                        res.json(response);
                    }
                    else {
                        client.initWallet(req.body.profitWalletUserName, req.body.profitWalletUserPassword, function (err, wallet) {
                            if (err) {
                                console.log(err.message);
                                console.log(err.code);
                                response.code = err.code;
                                response.message = err.message;
                                console.log(response);
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
                                        console.log(response);
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
                    if (merchant.useKraken == true) {
                        var krakenKey = merchant.krakenAPIKey;
                        var krakenSecret = merchant.krakenAPISecret;
                        const KrakenClient = require('kraken-api');
                        const kraken = new KrakenClient(krakenKey, krakenSecret);
                        kraken.api('Withdraw', { asset: 'XXBT', key: req.body.profitWalletKrakenBenificiaryKey, amount: 0.00500 }, function (error, data) {
                            if (error) {
                                response.code = 407;
                                response.message = error.message;
                                response.data = error;
                                res.json(response);
                                console.log(response);
                                console.log("Error is ");
                                console.log(error);
                                console.log("Code is " + error.Code);
                                console.log("Message is " + error.message);
                            }
                            else {
                                console.log("Data is");
                                console.log(data);
                                console.log("Data.Result is");
                                console.log(data.result);
                                merchant.profitWalletKrakenBenificiaryKey = req.body.profitWalletKrakenBenificiaryKey;
                                console.log("Benificiary Key is " + merchant.profitWalletKrakenBenificiaryKey);
                                merchant.save(function (err, merchant) {
                                    response.code = 200;
                                    response.message = "Success";
                                    response.data = merchant;
                                    res.json(response);
                                    console.log(response);
                                });
                            }
                        });
                    }
                    else {
                        console.log("Kraken is setup t0 false");
                        merchant.profitWalletAddress = req.body.profitWalletAddress;
                        merchant.save(function (err, merchant) {
                            response.code = 200;
                            response.message = "Success";
                            response.data = merchant;
                            res.json(response);
                            console.log(response);
                        });
                    }
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
                if (merchant.useKraken == true) {
                    var krakenKey = merchant.krakenAPIKey;
                    var krakenSecret = merchant.krakenAPISecret;
                    const KrakenClient = require('kraken-api');
                    const kraken = new KrakenClient(krakenKey, krakenSecret);
                    kraken.api('Withdraw', { asset: 'XXBT', key: req.body.bitpointProfitWalletKrakenBenificiaryKey, amount: 0.00500 }, function (error, data) {
                        if (error) {
                            response.code = 407;
                            response.message = error.message;
                            response.data = null;
                            res.json(response);
                            console.log(response);
                            console.log("Code is " + error.Code);
                            console.log("Error is ");
                            console.log(error);
                            console.log("Message is " + error.message);
                        }
                        else {
                            console.log("Data is");
                            console.log(data);
                            console.log("Data.Result is");
                            console.log(data.result);
                            merchant.bitpointProfitWalletKrakenBenificiaryKey = req.body.bitpointProfitWalletKrakenBenificiaryKey;
                            merchant.save(function (err, merchant) {
                                if (err) {
                                    
                                }
                                else
                                {
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
                else {
                    merchant.bitpointProfitWalletAddress = req.body.bitpointProfitWalletAddress;
                    merchant.save(function (err, merchant) {
                        if (err) {
                            
                        }
                        else
                        {
                            response.code = 200;
                            response.message = "Success";
                            response.data = merchant;
                            res.json(response);
                            console.log(response);
                        }
                    })
                }
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
                res.json(response);
            }
            else {
                response.message = "Invalid Pin";
                response.code = 205;
                response.data = null;
                res.json(response);
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

getTransactionsByMerchantIdRoute.post(function (req, res) {
    Transaction.find({ merchantId: req.body.merchantId }, function (err, transactions) {
        if (err) {
            response.data = err;
            response.code = 299;
            response.message = "Error in Getting Transactions";
            res.json(response);
            console.log("Error is " + err);
        }
        else {
            response.data = transactions;
            response.code = 200;
            response.message = "Success";
            res.json(response);
            console.log("Response is " + response);
        }
    });
});

getTransactionStatisticsByTimeRoute.post(function (req, res) {
    var startingTime = Math.floor(new Date());
    var endingTime = "";
    console.log("Starting Time is " + startingTime);
    if (req.body.filterTime == 1) {
        endingTime = Math.floor(new Date()) - 86400000;
    }
    else if (req.body.filterTime == 2) {
        endingTime = Math.floor(new Date()) - (7 * 86400000);
    }
    else if (req.body.filterTime == 3) {
        endingTime = Math.floor(new Date()) - (30 * 86400000);
    }
    else if (req.body.filterTime == 4) {
        endingTime = Math.floor(new Date()) - (90 * 86400000);
    }
    console.log("Ending time is " + endingTime);
    //res.json(endingTime);
    Transaction.find({
        transactionTime: {
            $gte: endingTime
        }
    }, function (err, transactions) {
        if (err) {
            response.data = err;
            response.code = 299;
            response.message = "Error in Getting Transactions";
            //res.json(response);
            console.log("Error is " + err);
        }
        else {
            var sendingVolume = 0;
            var receivingVolume = 0;
            var totalVolume = 0;
            transactions.forEach(function (element) {
                totalVolume += element.sendingAmount;
                if (element.transactionType == "SELL") {
                    sendingVolume += element.sendingAmount;
                }
                else {
                    receivingVolume += element.sendingAmount;
                }
            }, this);
            var obj = new Object();
            obj.sendingVolume = sendingVolume;
            obj.receivingVolume = receivingVolume;
            obj.totalVolume = totalVolume;
            response.data = obj;
            response.code = 200;
            response.message = "Success";
            res.json(response);
            console.log("Response is " + response);
        }
    });
});


getProfitStatisticsByTimeRoute.post(function (req, res) {
    var startingTime = Math.floor(new Date());
    var endingTime = "";
    console.log("Starting Time is " + startingTime);
    if (req.body.filterTime == 1) {
        endingTime = Math.floor(new Date()) - 86400000;
    }
    else if (req.body.filterTime == 2) {
        endingTime = Math.floor(new Date()) - (7 * 86400000);
    }
    else if (req.body.filterTime == 3) {
        endingTime = Math.floor(new Date()) - (30 * 86400000);
    }
    else if (req.body.filterTime == 4) {
        endingTime = Math.floor(new Date()) - (90 * 86400000);
    }
    console.log("Ending time is " + endingTime);
    //res.json(endingTime);
    Profit.find({
        profitTime: {
            $gte: endingTime
        }
    }, function (err, profits) {
        if (err) {
            response.data = err;
            response.code = 299;
            response.message = "Error in Getting Transactions";
            //res.json(response);
            console.log("Error is " + err);
        }
        else {
            var sendingProfit = 0;
            var receivingProfit = 0;
            var totalProfit = 0;
            profits.forEach(function (element) {
                totalProfit += element.profitTotal;
                if (element.profitType == "SELL") {
                    sendingProfit += element.profitTotal;
                }
                else {
                    receivingProfit += element.profitTotal;
                }
            }, this);
            var obj = new Object();
            obj.sendingProfit = sendingProfit;
            obj.receivingProfit = receivingProfit;
            obj.totalProfit = totalProfit;
            response.data = obj;
            response.code = 200;
            response.message = "Success";
            res.json(response);
            console.log("Response is " + response);
        }
    });
});

attachListenerRoute.post(function (req, res) {
    var merchantAccount = req.body.merchantAccount;
    var fcmId = req.body.fcmId;
    console.log("Merchant Account Address is " + merchantAccount);
    console.log("FCM Id is " + fcmId);
    utility.transactionListener(fcmId, merchantAccount);
    response.message = "Success";
    response.code = 200;
    res.json(response);
});

//var apiurl = "https://insight.bitpay.com/";
var apiurl = "https://blockexplorer.com/";
var socket = require('socket.io-client')(apiurl);

var transactionArray = [];


global.btc_address = 'mnZswjQ4qqoNZRsQ5GWZnDPvEPm8uDpArz';

socket.on('connect', function () {
    // Join the room.
    socket.emit('subscribe', 'inv');
});
socket.on('block', function (data) {
    console.log("Block");
    console.log(data);
    if (transactionArray.length != 0) {
        processBlockOfBitcoin(transactionArray);
    }
});
var userArray = [];
var receiverUserArray = [];
User.find({ userRole: 2 }, function (err, users) {
    userArray = users;
});
ReceiverBalance.find({}, function (err, receiverBalances) {
    receiverUserArray = receiverBalances;
});

socket.on('tx', function (data) {
    //console.log("Transaction");
    //console.log(data);
    for (var i = 0; i < data.vout.length; i++) {
        var obj = data.vout[i];
        for (property in obj) {
            //console.log("Property is "+property);
            var checkUser = userArray.find(x => x.userEthereumId == property);
            if (checkUser !== undefined) {
                if (property == '34Cdzfg8pEaadbTf1MTnHqi9ughZ5fVkrV') {
                    console.log("Element User EthereumId is " + checkUser.userEthereumId);
                    console.log("From transaction , address is " + property);
                }
                if (checkUser.userEthereumId == property) {
                    console.log(property);
                    console.log("*****************************************Transaction is pushed******************************");
                    transactionArray.push(data);
                }
            }
        }
    }
});

function processBlockOfBitcoin(transactionArray) {
    asyncLoop(transactionArray, function (item, next) {
        try {
            console.log("Item Transaction Id is " + item.txid);
            processBlockExplorerData(item.txid);
            /*webClient.get("https://blockexplorer.com/api/tx/" + item.txid, function (data, resp) {
                console.log("Item is ");
                console.log(item);
                console.log("Data from blockxplorer transaction is ");
                console.log(data);
                for (var j = 0; j < data.vout.length; j++) {
                    var checkUser = userArray.find(x => x.userEthereumId == data.vout[j].addr);
                    if (checkUser !== undefined) {
                        console.log("Vout us matched " + data.vout[j].addr);
                        ReceiverBalance.find({}, function (err, receiverBalances) {
                            receiverBalances.forEach(function (elementReceiverBalance) {
                                for (var i = 0; i < data.vin[i].length; i++) {
                                    if (elementReceiverBalance.senderAddress == data.vin[i].addr) {
                                        console.log("Vin is matched " + data.vin[i].addr);
                                        ReceiverBalance.findOne({ receiverAddress: element.userEthereumId }, function (err, receiverBalance) {
                                            console.log("Sending message , fcmID " + receiverBalance.receiverFCMId);
                                            utility.sendTransactionReceivedNotificationMessage(receiverBalance.receiverFCMId, elementReceiverBalance.senderAddress);
                                        });
                                    }
                                }
                            }, this);
                        });
                    }
                }
            });*/
            next();
        }
        catch (ex) {
            console.log(ex);
            next();
        }
    });
}

postSaveSenderAddressRoute.post(function (req, res) {
    console.log("postSaveSenderAddressRoute is Called");
    var senderAddress = req.body.senderAddress;
    var receiverAddress = req.body.receiverAddress;
    var receiverBalance = new ReceiverBalance();
    console.log("Sender Address is " + senderAddress);
    console.log("Receiver Address is " + receiverAddress);
    console.log("FCM ID is " + req.body.fcmId);
    receiverBalance.senderAddress = senderAddress;
    receiverBalance.receiverAddress = receiverAddress;
    receiverBalance.receiverFCMId = req.body.fcmId;
    receiverBalance.save(function (err, receiverBalance) {
        response.message = "Success";
        response.code = 200;
        response.data = receiverBalance;
        console.log("receive Balance Object is ");
        console.log(receiverBalance);
        receiverUserArray.push(receiverBalance);
        res.json(response);
    });
});

postUpdateLatLongRoute.post(function (req, res) {
    User.findById(req.body.userId, function (err, user) {
        user.lat = req.body.lat;
        user.lng = req.body.long;
        user.save(function (err, user) {
            response.message = "Success";
            response.code = 200;
            response.data = user;
            res.json(response);
        });
    });
});

function processBlockExplorerData(transactionId) {
    console.log("processBlockExplorerData is called");
    webClient.get("https://blockexplorer.com/api/tx/" + transactionId, function (data, resp) {
        console.log("Data from blockxplorer transaction is ");
        console.log(data);
        for (var j = 0; j < data.vout.length; j++) {
            console.log("data.vout.lenghth is " + data.vout.length);
            var voutAddressesFromTransaction = data.vout[j].scriptPubKey.addresses;
            console.log(voutAddressesFromTransaction);
            for (var addressCount = 0; addressCount < voutAddressesFromTransaction.length; addressCount = addressCount + 1) {
                var checkUser = userArray.find(x => x.userEthereumId == voutAddressesFromTransaction[addressCount]);
                if (checkUser !== undefined) {
                    console.log("Check user is defined");
                    console.log("Vin length is " + data.vin.length);
                    for (var i = 0; i < data.vin.length; i++) {
                        console.log("Data.vin is " + data.vin[i].addr);
                        var receivedUser = receiverUserArray.find(x => x.senderAddress == data.vin[i].addr);
                        if (receivedUser != undefined) {
                            console.log("Vin is matched " + data.vin[i].addr);
                            console.log("Sending message , fcmID " + receivedUser.receiverFCMId);
                            utility.sendTransactionReceivedNotificationMessage(receivedUser.receiverFCMId, receivedUser.senderAddress, data.vout[j].value);
                        }
                    }
                }
                console.log("Value of AddressCount is " + addressCount);
            }
        }
    });
}

getTestTransactionDataRoute.get(function (req, res) {
    processBlockExplorerData(req.query.transactionId);
});

postUpdateUseKrakenRoute.post(function (req, res) {
    User.findOne({ _id: req.body.merchantId }, function (err, merchant) {
        merchant.useKraken = req.body.useKraken;
        merchant.save(function (err, merchant) {
            if (err) {
                response.data = err;
                response.code = 299;
                response.message = "Error setting Kraken use";
                res.json(response);
                console.log("Error is " + err);
            }
            else {
                response.message = "Success";
                response.code = 200;
                response.data = merchant;
                res.json(response);
            }
        });
    });
});


module.exports = router;