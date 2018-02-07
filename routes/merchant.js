var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var asyncLoop = require('node-async-loop');
var WAValidator = require('wallet-address-validator');
var cron = require('node-cron');

var Client = require('node-rest-client').Client;
var jwt = require('jsonwebtoken');

var User = require('./../models/User');
var blocktrail = require('blocktrail-sdk');

var multipartMiddleware = multipart();

var adminLoginRoute = router.route('/adminLogin');
var postChangePassword = router.route('/changePassword');
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
var sendEmailRoute = router.route('/sendEmail');
var sendUnConfirmedTransactionNofyification = router.route('/sendUnConfirmedTransactionNofyification');
var sendConfirmedTransactionNofyification = router.route('/sendConfirmedTransactionNofyification');
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

postChangePassword.post(function (req, res) {
    var response = new Response();
    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;
    var _userId = req.body.userId;
    var passCode = req.body.passCode;
    if (oldPassword && newPassword) {
        if (oldPassword == newPassword) {
            response.code = 100;
            response.message = "New password cannot be same as old";
            res.json(response);
        } else {
            //here handle to change password
            User.findOne({ _id: _userId }, function (err, user) {
                if (user == null) {
                    response.code = 400;
                    response.message = "User Does not exists";
                    res.json(response);
                } else {
                    user.userPassword = password.createHash(newPassword);
                    user.save(function (err, resp) {
                        if (err) {
                            response.code = 500;
                            response.message = "Internal error";
                            res.json(response);
                            console.log(err);
                        } else {
                            response.code = 200;
                            response.message = "Password Updated Successfully";
                            res.json(response);
                        }
                    });
                } //end of else
            });
        } //end of else for changing password
    } else {
        response.code = 300;
        response.message = "Params cannot be null";
        res.json(response);
    }
});

adminLoginRoute.post(function (req, res) {
    var userName = req.body.userName;
    var userPassword = req.body.userPassword;
    User.findOne({ userName: userName }, function (err, user) {
        if (err) {
            console.log(err);
        } else {
            if (user != null) {
                var validate = password.validateHash(user.userPassword, req.body.userPassword);
                if (validate == true) {
                    response.message = "Success";
                    response.code = 200;
                    client.address(user.userBtcId, function (err, address) {
                        if (err) {
                            response.data = null;
                            response.message = "Error in Getting Address";
                            response.code = 505;
                            res.json(err);
                        } else {
                            console.log("Customer address is ");
                            console.log(address);
                            console.log("Customer Balance is " + address.balance);
                            user.hotWalletBalance = parseFloat(address.balance) / 100000000;
                            user.save(function (err, user) {
                                response.data = user;
                                console.log("User is");
                                console.log(user);
                                res.json(response);
                            });
                        }
                    });
                } else {
                    response.message = "Invalid User Name or Password";
                    response.code = serverMessage.returnPasswordMissMatch();
                    response.data = null;
                    res.json(response);
                }
            } else {
                response.message = "User Does not Exist";
                response.code = serverMessage.returnPasswordMissMatch();
                response.data = null;
                res.json(response);
            }
        }
    });
});

createMerchantRoute.post(function (req, res) {
    console.log("Create Merchant");
    var BtcUser = new User();
    BtcUser.userName = req.body.userName;
    BtcUser.userEmail = req.body.userEmail;
    BtcUser.userPassword = password.createHash(req.body.userPassword);
    BtcUser.userFullName = req.body.userName;
    BtcUser.userRole = req.body.userRole;
    BtcUser.createdOnUTC = Math.floor(new Date());
    BtcUser.updatedOnUTC = Math.floor(new Date());
    BtcUser.minimumHotWalletBalance = 0.25;
    BtcUser.maximumHotWalletBalance = 0.50;
    BtcUser.merchantProfit = 0;
    BtcUser.merchantProfitMargin = 10;
    BtcUser.useKraken = false;
    console.log("USer Password for Wallet Creation is " + BtcUser.userPassword);
    client.createNewWallet(BtcUser.userName, BtcUser.userPassword, function (err, wallet, backupInfo) {
        console.log("Wallet ");
        console.log(wallet);
        console.log("BackupInfo");
        console.log(backupInfo);
        if (err) {
            console.log(err.message);
            console.log(err.code);
            response.code = err.code;
            response.message = "Hot Wallet with this identifeier exists. Please try a different user name";
            res.json(response);
        } else {
            client.initWallet(BtcUser.userName, BtcUser.userPassword, function (err, wallet) {
                console.log("wallet after Initializing ");
                console.log(wallet);
                wallet.getNewAddress(function (err, address) {
                    console.log("Address");
                    console.log(address);
                    //global.addressArray.push(address);
                    BtcUser.userBtcId = address;
                    BtcUser.hotWalletBalance = 0;
                    BtcUser.save(function (err, BtcUser) {
                        response.code = 200;
                        response.message = "Successfully Created";
                        response.data = BtcUser;
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
        } else {
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
        } else {
            if (merchant == null) {
                response.code = 500;
                response.message = "Merchant does not exist";
                response.data = null;
                res.json(response);
            } else {
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
    User.findOne({ userName: merchantUserName }, function (err, BtcUser) {
        if (BtcUser == null) {
            response.data = null;
            response.message = "Merchant does not exist";
            response.code = 500;
            console.log(response);
            res.json(response);
        } else {
            client.address(BtcUser.userBtcId, function (err, address) {
                if (err) {
                    response.data = null;
                    response.message = "Error in Getting Address";
                    response.code = 505;
                    res.json(err);
                } else {
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
                    } else {
                        client.initWallet(BtcUser.userName, BtcUser.userPassword, function (err, wallet) {
                            if (err) {
                                response.code = 295;
                                response.message = err.message;
                                response.data = err;
                                res.json(response);
                                console.log("Error in Initializing Wallet is ");
                                console.log(err);
                            } else {
                                console.log("Amount in Satoshi is" + amountToSend);
                                console.log("Customer Address is");
                                console.log(customerAddress);
                                console.log("Wallet is " + wallet);
                                console.log(wallet);
                                var obj = {};
                                obj[customerAddress] = amountToSend;
                                wallet.pay(obj, null, false, true, blocktrail.Wallet.FEE_STRATEGY_OPTIMAL, function (err, result) {
                                    if (err) {
                                        response.data = err;
                                        response.message = "Could not Sent";
                                        response.code = 280;
                                        console.log("Error is Wallet paying is ");
                                        console.log(err);
                                        res.json(response);
                                    } else {
                                        console.log("Result in paying to Customer Address from Wallet is");
                                        console.log(result);
                                        var krakenApi = require("kraken-api");
                                        var krakenKey = BtcUser.krakenAPIKey;
                                        var krakenSecret = BtcUser.krakenAPISecret;
                                        const KrakenClient = require('kraken-api');
                                        const kraken = new KrakenClient(krakenKey, krakenSecret);
                                        var transaction = new Transaction();
                                        transaction.merchantId = BtcUser._id;
                                        transaction.customerAddress = customerAddress;
                                        transaction.sendingAmount = amount;
                                        transaction.transactionType = "SELL";
                                        transaction.transactionId = result;
                                        transaction.transactionTime = Math.floor(new Date());
                                        transaction.status = "PENDING";
                                        transaction.save();
                                        response.data = result;
                                        response.code = 200;
                                        response.message = "Success";
                                        res.json(response);
                                        // Profit ENTRY
                                        var profit = new Profit();
                                        profit.merchantId = BtcUser._id;
                                        profit.customerAddress = customerAddress;
                                        profit.profitTotal = req.body.merchantProfit;
                                        profit.transactionId = result;
                                        profit.profitTime = Math.floor(new Date());
                                        profit.profitType = "SELL";
                                        profit.save();
                                        // 
                                        if (hotWalletBalance < BtcUser.minimumHotWalletBalance) {
                                            var sendingAmount = BtcUser.maximumHotWalletBalance - hotWalletBalance;
                                            if (BtcUser.useKraken == true) {
                                                kraken.api('Withdraw', { asset: 'XXBT', key: BtcUser.hotWalletBenificiaryKey, amount: sendingAmount }, function (err, data) {
                                                    if (err) {
                                                        response.message = "Kraken " + err.message;
                                                        response.message = "Withdraw Error";
                                                        response.code = 770;
                                                        console.log(response);
                                                    } else {
                                                        response.data = data;
                                                        response.message = "Sent in Customer Hot Wallet from Kraken";
                                                        response.code = 200;
                                                        console.log(response);
                                                    }
                                                });
                                            }
                                        }
                                        // For Profit Setup
                                        console.log("Mechant Profit before Add up is " + BtcUser.merchantProfit);
                                        console.log("Merchant Profit from request is " + req.body.merchantProfit);
                                        BtcUser.merchantProfit += req.body.merchantProfit;
                                        console.log("Mechant Profit after Add up is " + BtcUser.merchantProfit);
                                        if (BtcUser.merchantProfit >= BtcUser.merchantProfitThreshold) {
                                            AdminConfigurations.findOne({}, function (err, adminConfiguration) {
                                                var merchantProfitToSend = ((BtcUser.merchantProfit * adminConfiguration.merchantProfit) / 100);
                                                console.log("Profit to send to Merchant is " + merchantProfitToSend);
                                                var btmProfitToSend = ((BtcUser.merchantProfit * adminConfiguration.bitpointProfit) / 100);
                                                console.log("Profit to send to BTM WALLET is " + btmProfitToSend);
                                                var newMerchantProfit = BtcUser.merchantProfit;
                                                if (BtcUser.useKraken == true) {
                                                    kraken.api('Withdraw', { asset: 'XXBT', key: BtcUser.profitWalletKrakenBenificiaryKey, amount: merchantProfitToSend }, function (err, data) {
                                                        if (err) {
                                                            response.message = "Kraken " + err.message;
                                                            response.message = "Error in Sending Profit to Merchant Profit Wallet";
                                                            response.code = 770;
                                                            console.log(response);
                                                        } else {
                                                            response.data = data;
                                                            response.message = "Sent to Profit Wallet from Kraken";
                                                            response.code = 200;
                                                            console.log(response);
                                                        }
                                                    });
                                                    kraken.api('Withdraw', { asset: 'XXBT', key: BtcUser.bitpointProfitWalletKrakenBenificiaryKey, amount: btmProfitToSend }, function (err, data) {
                                                        if (err) {
                                                            response.data = err.message;
                                                            response.message = "Kraken " + err.message;
                                                            response.code = 770;
                                                            console.log(response);
                                                        } else {
                                                            response.data = data;
                                                            response.message = "Sent in BTM Profit Wallet from Kraken";
                                                            response.code = 200;
                                                            console.log(response);
                                                        }
                                                    });
                                                } else {
                                                    var objSendProfitToMerchant = {};
                                                    objSendProfitToMerchant[BtcUser.profitWalletAddress] = blocktrail.toSatoshi(merchantProfitToSend);
                                                    wallet.pay(objSendProfitToMerchant, null, false, true, blocktrail.Wallet.FEE_STRATEGY_BASE_FEE, function (err, result) {
                                                        if (err) {
                                                            response.data = err.message;
                                                            response.message = "Error in Sending Profit to Merchant Profit Wallet";
                                                            response.code = 770;
                                                            console.log(response);
                                                        } else {
                                                            response.data = result;
                                                            response.message = "Sent to Profit Wallet from BlockTrail";
                                                            response.code = 200;
                                                            console.log(response);
                                                        }
                                                    });

                                                    var objSendProfitToBitpointProfitWallet = {};
                                                    objSendProfitToBitpointProfitWallet[BtcUser.bitpointProfitWalletAddress] = blocktrail.toSatoshi(btmProfitToSend);
                                                    wallet.pay(objSendProfitToBitpointProfitWallet, null, false, true, blocktrail.Wallet.FEE_STRATEGY_BASE_FEE, function (err, result) {
                                                        if (err) {
                                                            response.data = err.message;
                                                            response.message = "Error in Sending Profit to Bitpoint Profit Wallet";
                                                            response.code = 770;
                                                            console.log(response);
                                                        } else {
                                                            response.data = result;
                                                            response.message = "Sent to Bitpoint Profit Wallet from BlockTrail";
                                                            response.code = 200;
                                                            console.log(response);
                                                        }
                                                    });
                                                }
                                                BtcUser.merchantProfit = 0;
                                                BtcUser.save(function (err, BtcUser) {

                                                });
                                            });
                                        } else {
                                            BtcUser.save(function (err, BtcUser) {

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
    User.findOne({ userName: merchantUserName }, function (err, BtcUser) {
        if (BtcUser == null) {
            response.data = null;
            response.message = "Merchant does not exist";
            response.code = 500;
            console.log(response);
            res.json(response);
        } else {
            client.address(customerAddress, function (err, address) {
                if (err) {
                    response.data = null;
                    response.message = "Error in Getting Address";
                    response.code = 505;
                    console.log("Error in Getting Address");
                    console.log(err);
                    res.json(err);
                } else {
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
                    } else {
                        client.initWallet(walletName, walletPassword, function (err, wallet) {
                            if (err) {
                                response.code = 295;
                                response.message = err.message;
                                response.data = err;
                                res.json(response);
                                console.log("Error in Initializing Wallet is ");
                                console.log(err);
                            } else {
                                console.log("Amount in Satoshi is" + amountToSend);
                                console.log("Customer Address is");
                                console.log(customerAddress);
                                console.log("Wallet is " + wallet);
                                console.log(wallet);
                                var obj = {};
                                obj[BtcUser.userBtcId] = amountToSend;
                                wallet.pay(obj, null, false, true, blocktrail.Wallet.FEE_STRATEGY_BASE_FEE, function (err, result) {
                                    if (err) {
                                        response.data = err;
                                        response.message = "Could not Sent";
                                        response.code = 280;
                                        console.log("Error is Wallet paying is ");
                                        console.log(err);
                                        res.json(response);
                                    } else {
                                        console.log("Result in paying to Hot Wallet Address from Customer is");
                                        console.log(result);
                                        var krakenApi = require("kraken-api");
                                        var krakenKey = BtcUser.krakenAPIKey;
                                        var krakenSecret = BtcUser.krakenAPISecret;
                                        const KrakenClient = require('kraken-api');
                                        const kraken = new KrakenClient(krakenKey, krakenSecret);
                                        var transaction = new Transaction();
                                        transaction.merchantId = BtcUser._id;
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
                                        console.log("Mechant Profit before Add up is " + BtcUser.merchantProfit);
                                        console.log("Merchant Profit from request is " + req.body.merchantProfit);
                                        BtcUser.merchantProfit += req.body.merchantProfit;
                                        // Profit ENTRY
                                        var profit = new Profit();
                                        profit.merchantId = BtcUser._id;
                                        profit.customerAddress = customerAddress;
                                        profit.profitTotal = req.body.merchantProfit;
                                        profit.transactionId = result;
                                        profit.profitTime = Math.floor(new Date());
                                        profit.profitType = "BUY";
                                        profit.save();
                                        // 
                                        console.log("Mechant Profit after Add up is " + BtcUser.merchantProfit);
                                        if (BtcUser.merchantProfit > BtcUser.merchantProfitThreshold) {
                                            AdminConfigurations.findOne({}, function (err, adminConfiguration) {
                                                var merchantProfitToSend = ((BtcUser.merchantProfit * adminConfiguration.merchantProfit) / 100);
                                                console.log("Profit to send to Merchant is " + merchantProfitToSend);
                                                var btmProfitToSend = ((BtcUser.merchantProfit * adminConfiguration.bitpointProfit) / 100);
                                                console.log("Profit to send to BTM WALLET is " + btmProfitToSend);
                                                var newMerchantProfit = BtcUser.merchantProfit;
                                                kraken.api('Withdraw', { asset: 'XXBT', key: BtcUser.profitWalletKrakenBenificiaryKey, amount: merchantProfitToSend }, function (err, data) {
                                                    if (err) {
                                                        response.data = err.message;
                                                        response.message = "Kraken " + err.message;
                                                        response.code = 770;
                                                        console.log(response);
                                                    } else {
                                                        response.data = data;
                                                        response.message = "Sent to Profit Wallet from Kraken";
                                                        response.code = 200;
                                                        console.log(response);
                                                    }
                                                });
                                                kraken.api('Withdraw', { asset: 'XXBT', key: BtcUser.bitpointProfitWalletKrakenBenificiaryKey, amount: btmProfitToSend }, function (err, data) {
                                                    if (err) {
                                                        response.data = err.message;
                                                        response.message = "Error in Sending Profit to BTM Profit Wallet";
                                                        response.code = 770;
                                                        console.log(response);
                                                    } else {
                                                        response.data = data;
                                                        response.message = "Sent in BTM Profit Wallet from Kraken";
                                                        response.code = 200;
                                                        console.log(response);
                                                    }
                                                });
                                                BtcUser.merchantProfit = 0;
                                                BtcUser.save(function (err, BtcUser) {

                                                });
                                            });
                                        } else {
                                            BtcUser.save(function (err, BtcUser) {

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
    BtcUser.findOne({ userBtcId: address }, function (err, merchant) {
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
        } else {
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
        } else {
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
        } else {
            merchant.BtcUserPasscode = req.body.UserPasscode;
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
        } else {
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
        } else {
            merchant.krakenAPIKey = req.body.krakenAPIKey;
            merchant.krakenAPISecret = req.body.krakenAPISecret;
            if (req.body.isToggleChange == 1) {
                merchant.useKraken = true;
            }
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
        } else {
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
        } else {
            if (req.body.createNewProfitWallet == 1) {
                client.createNewWallet(req.body.profitWalletUserName, req.body.profitWalletUserPassword, function (err, wallet, backupInfo) {
                    if (err) {
                        console.log(err.message);
                        console.log(err.code);
                        response.code = err.code;
                        response.message = err.message;
                        console.log(response);
                        res.json(response);
                    } else {
                        client.initWallet(req.body.profitWalletUserName, req.body.profitWalletUserPassword, function (err, wallet) {
                            if (err) {
                                console.log(err.message);
                                console.log(err.code);
                                response.code = err.code;
                                response.message = err.message;
                                console.log(response);
                                res.json(response);
                            } else {
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
            } else {
                if (req.body.profitWalletAddress != "") {
                    merchant.profitWalletAddress = req.body.profitWalletAddress;
                }
                //if (merchant.useKraken == true) {
                if (req.body.profitWalletKrakenBenificiaryKey != null && req.body.profitWalletKrakenBenificiaryKey != undefined && req.body.profitWalletKrakenBenificiaryKey.length > 0) {
                    var krakenKey = merchant.krakenAPIKey;
                    var krakenSecret = merchant.krakenAPISecret;
                    const KrakenClient = require('kraken-api');
                    const kraken = new KrakenClient(krakenKey, krakenSecret);
                    kraken.api('Withdraw', { asset: 'XXBT', key: req.body.profitWalletKrakenBenificiaryKey, amount: 0.00500 }, function (error, data) {
                        if (error) {
                            response.code = 407;
                            response.message = "Kraken " + error.message;
                            response.data = error;
                            res.json(response);
                            console.log(response);
                            console.log("Error is ");
                            console.log(error);
                            console.log("Code is " + error.Code);
                            console.log("Message is " + error.message);
                        } else {
                            console.log("Data is");
                            console.log(data);
                            console.log("Data.Result is");
                            console.log(data.result);
                            merchant.profitWalletKrakenBenificiaryKey = req.body.profitWalletKrakenBenificiaryKey;
                            if (merchant.profitWalletKrakenBenificiaryKey == undefined) {
                                merchant.profitWalletKrakenBenificiaryKey == "";
                            }
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
                } else {
                    console.log("Kraken is setup t0 false");
                    merchant.profitWalletAddress = req.body.profitWalletAddress;
                    merchant.profitWalletKrakenBenificiaryKey = req.body.profitWalletKrakenBenificiaryKey;
                    if (merchant.profitWalletKrakenBenificiaryKey == undefined) {
                        merchant.profitWalletKrakenBenificiaryKey == "";
                    }
                    var valid = WAValidator.validate(req.body.profitWalletAddress, 'BTC');
                    if (valid) {
                        console.log('This is a valid address');
                        merchant.save(function (err, merchant) {
                            response.code = 200;
                            response.message = "Success";
                            response.data = merchant;
                            res.json(response);
                            console.log(response);
                        });
                    } else {
                        response.code = 203;
                        response.message = "INVALID ADDRESS";
                        response.data = null;
                        res.json(response);
                        console.log(response);
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
        } else {
            if (req.body.bitpointProfitWalletAddress != "") {
                merchant.bitpointProfitWalletAddress = req.body.bitpointProfitWalletAddress;
            }
            if (req.body.bitpointProfitWalletKrakenBenificiaryKey != null && req.body.bitpointProfitWalletKrakenBenificiaryKey != undefined && req.body.bitpointProfitWalletKrakenBenificiaryKey.length > 0) {
                var krakenKey = merchant.krakenAPIKey;
                var krakenSecret = merchant.krakenAPISecret;
                const KrakenClient = require('kraken-api');
                const kraken = new KrakenClient(krakenKey, krakenSecret);
                kraken.api('Withdraw', { asset: 'XXBT', key: req.body.bitpointProfitWalletKrakenBenificiaryKey, amount: 0.005 }, function (error, data) {
                    if (error) {
                        response.code = 407;
                        response.message = "Kraken " + error.message;
                        response.data = null;
                        res.json(response);
                        console.log(response);
                        console.log("Code is " + error.Code);
                        console.log("Error is ");
                        console.log(error);
                        console.log("Message is " + error.message);
                    } else {
                        console.log("Data is");
                        console.log(data);
                        console.log("Data.Result is");
                        console.log(data.result);
                        merchant.bitpointProfitWalletKrakenBenificiaryKey = req.body.bitpointProfitWalletKrakenBenificiaryKey;
                        merchant.save(function (err, merchant) {
                            if (err) {

                            } else {
                                response.code = 200;
                                response.message = "Success";
                                response.data = merchant;
                                res.json(response);
                                console.log(response);
                            }
                        })
                    }
                });
            } else {
                merchant.bitpointProfitWalletAddress = req.body.bitpointProfitWalletAddress;
                var valid = WAValidator.validate(req.body.bitpointProfitWalletAddress, 'BTC');
                if (valid) {
                    console.log('This is a valid address');
                    merchant.save(function (err, merchant) {
                        if (err) {

                        } else {
                            response.code = 200;
                            response.message = "Success";
                            response.data = merchant;
                            res.json(response);
                            console.log(response);
                        }
                    })
                } else {
                    console.log('Address INVALID');
                    response.code = 203;
                    response.message = "INVALID ADDRESS";
                    response.data = null;
                    res.json(response);
                    console.log(response);
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
        } else {
            if (merchant.BtcUserPasscode == req.body.UserPasscode) {
                response.message = "Success";
                response.code = 200;
                response.data = merchant;
                res.json(response);
            } else {
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
        } else {
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
        } else {
            response.data = trx;
            response.code = 200;
            response.message = "Success";
            res.json(response);
            console.log("Error is " + err);
        }
    });
});

getTransactionsByMerchantIdRoute.post(function (req, res) {
    var query = {};
    if (req.body.merchantId == -1) {

    }
    else {
        query["merchantId"] = req.body.merchantId;
    }
    Transaction.find(query, function (err, transactions) {
        if (err) {
            response.data = err;
            response.code = 299;
            response.message = "Error in Getting Transactions";
            res.json(response);
            console.log("Error is " + err);
        } else {
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
    } else if (req.body.filterTime == 2) {
        endingTime = Math.floor(new Date()) - (7 * 86400000);
    } else if (req.body.filterTime == 3) {
        endingTime = Math.floor(new Date()) - (30 * 86400000);
    } else if (req.body.filterTime == 4) {
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
        } else {
            var sendingVolume = 0;
            var receivingVolume = 0;
            var totalVolume = 0;
            transactions.forEach(function (element) {
                if (element.sendingAmount != undefined && element.sendingAmount != null) {
                    totalVolume += element.sendingAmount;
                    if (element.transactionType == "SELL") {
                        sendingVolume += element.sendingAmount;
                    } else {
                        receivingVolume += element.sendingAmount;
                    }
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
    } else if (req.body.filterTime == 2) {
        endingTime = Math.floor(new Date()) - (7 * 86400000);
    } else if (req.body.filterTime == 3) {
        endingTime = Math.floor(new Date()) - (30 * 86400000);
    } else if (req.body.filterTime == 4) {
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
        } else {
            var sendingProfit = 0;
            var receivingProfit = 0;
            var totalProfit = 0;
            profits.forEach(function (element) {
                if (element.profitTotal != null && element.profitTotal != undefined) {
                    totalProfit += element.profitTotal;
                    if (element.profitType == "SELL") {
                        sendingProfit += element.profitTotal;
                    } else {
                        receivingProfit += element.profitTotal;
                    }
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

var apiurl = "https://insight.bitpay.com/";
//var apiurl = "https://blockexplorer.com/";
var socket = require('socket.io-client')(apiurl);

var transactionArray = [];

socket.on('connect', function () {
    // Join the room.
    socket.emit('subscribe', 'inv');
});
socket.on('block', function (data) {
    console.log("Block");
    console.log(data);
    if (transactionArray.length != 0) {

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
            var checkUser = userArray.find(x => x.userBtcId == property);
            if (checkUser !== undefined) {
                if (checkUser.userBtcId == property) {
                    console.log(property);
                    console.log("*****************************************Transaction is pushed******************************");
                    console.log("Transaction Id is " + data.txid);
                    transactionArray.push(data);
                    var transaction = new Transaction();
                    transaction.merchantId = checkUser.userBtcId;
                    transaction.transactionType = "SELL";
                    transaction.transactionStatus = "PENDING";
                    transaction.transactionId = data.txid;
                    transaction.transactionTime = Math.floor(new Date());
                    transaction.save();
                    ReceiverBalance.findOne({ receiverAddress: checkUser.userBtcId }, function (err, receiver) {
                        utility.sendTransactionUnConfirmedNotificationMessage(receiver.receiverFCMId, data.txid, data.valueOut);
                    });
                }
            }
        }
    }
});


postSaveSenderAddressRoute.post(function (req, res) {
    console.log("postSaveSenderAddressRoute is Called");
    var receiverAddress = req.body.receiverAddress;
    var receiverBalance = new ReceiverBalance();
    console.log("Receiver Address is " + receiverAddress);
    console.log("FCM ID is " + req.body.fcmId);
    receiverBalance.receiverAddress = receiverAddress;
    receiverBalance.receiverFCMId = req.body.fcmId;
    receiverBalance.save(function (err, receiverBalance) {
        response.message = `Listening for incoming transactions`;
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




postUpdateUseKrakenRoute.post(function (req, res) {
    User.findOne({ _id: req.body.merchantId }, function (err, merchant) {
        merchant.useKraken = req.body.useKraken;
        var useKraken = req.body.useKraken;
        console.log("Use Kraken is " + merchant.bitpointProfitWalletKrakenBenificiaryKey);
        if (useKraken == true) {
            console.log("Kraken APi is " + merchant.krakenAPIKey);
            console.log("Kraken APi Secret  is " + merchant.krakenAPISecret);
            if (merchant.krakenAPIKey == null || merchant.krakenAPISecret == null || merchant.krakenAPISecret == "" || merchant.krakenAPIKey == "" || merchant.krakenAPIKey == undefined || merchant.krakenAPISecret == undefined) {
                console.log("Kraken Keys are empty");
                response.data = null;
                response.code = 297;
                response.message = "Please set Kraken First";
                res.json(response);
                console.log("Error is " + err);
            } else if (merchant.hotWalletBenificiaryKey == null || merchant.hotWalletBenificiaryKey == "" || merchant.hotWalletBenificiaryKey == "null" || merchant.hotWalletBenificiaryKey == undefined) {
                console.log("Hot Wallet Benificiary Key is Empty");
                response.data = null;
                response.code = 296;
                response.message = "Hot Wallet Benificiary Key is not set";
                res.json(response);
                console.log("Error is " + err);
            } else if (merchant.profitWalletAddress == null || merchant.profitWalletAddress == "" || merchant.profitWalletAddress == "null" || merchant.profitWalletAddress == undefined) {
                console.log("Profit Wallet Address is Empty");
                response.data = null;
                response.code = 296;
                response.message = "Profit Wallet Address is Empty";
                res.json(response);
                console.log("Error is " + err);
            } else if (merchant.profitWalletKrakenBenificiaryKey == null || merchant.profitWalletKrakenBenificiaryKey == "" || merchant.profitWalletKrakenBenificiaryKey == "null" || merchant.profitWalletKrakenBenificiaryKey == undefined) {
                console.log("Profit Wallet Benificiary is Empty");
                response.data = null;
                response.code = 296;
                response.message = "Profit Wallet Benificiary is not set";
                res.json(response);
                console.log("Error is " + err);
            } else if (merchant.bitpointProfitWalletAddress == null || merchant.bitpointProfitWalletAddress == "" || merchant.bitpointProfitWalletAddress == "null" || merchant.bitpointProfitWalletAddress == undefined) {
                console.log("Bitpoint Wallet Address is Empty");
                response.data = null;
                response.code = 296;
                response.message = "Bitpoint Wallet Address is not set";
                res.json(response);
                console.log("Error is " + err);
            } else if (merchant.bitpointProfitWalletKrakenBenificiaryKey == null || merchant.bitpointProfitWalletKrakenBenificiaryKey == "" || merchant.bitpointProfitWalletKrakenBenificiaryKey == "null" || merchant.bitpointProfitWalletKrakenBenificiaryKey == undefined) {
                console.log("Bitpoint Profit Wallet Benificiary is not set");
                response.data = null;
                response.code = 296;
                response.message = "Bitpoint Profit Wallet Benificiary is not set";
                res.json(response);
                console.log("Error is " + err);
            } else {
                merchant.save(function (err, merchant) {
                    if (err) {
                        response.data = err;
                        response.code = 299;
                        response.message = "Error setting Kraken use";
                        res.json(response);
                        console.log("Error is " + err);
                    } else {
                        response.message = "Success";
                        response.code = 200;
                        response.data = merchant;
                        res.json(response);
                    }
                });
            }
        } else {
            console.log("ELSE ----------");
            merchant.save(function (err, merchant) {
                if (err) {
                    response.data = err;
                    response.code = 299;
                    response.message = "Error setting Kraken use";
                    res.json(response);
                    console.log("Error is " + err);
                } else {
                    response.message = "Success";
                    response.code = 200;
                    response.data = merchant;
                    res.json(response);
                }
            });
        }
    });
});

sendEmailRoute.get(function (req, res) {
    utility.sendTransactionUnConfirmedNotificationMessage('d4rxQxP5bWM:APA91bGC3IIqldNujJDTCcZJ0IX3oYDm9bchTPgenkj7YmoE8CFRn8N1brxys7vgONtkhGMCsIjbCukTPaxz3_qwpT4CjbVV4fOv0KBvMRcR9BOSvnjpalCmVePiOJ4NLDqjRGZEK2vn', 'c89cfb4c5a2bd79378293298fa1466960dbd0dab8d13e6e6331dd923837fb86b', '1.24974378');
    //utility.sendTransactionReceivedNotificationMessage('d4rxQxP5bWM:APA91bGC3IIqldNujJDTCcZJ0IX3oYDm9bchTPgenkj7YmoE8CFRn8N1brxys7vgONtkhGMCsIjbCukTPaxz3_qwpT4CjbVV4fOv0KBvMRcR9BOSvnjpalCmVePiOJ4NLDqjRGZEK2vn', '1234.987','c89cfb4c5a2bd79378293298fa1466960dbd0dab8d13e6e6331dd923837fb86b');
    res.json("sdf");
});

cron.schedule('*/10 * * * *', function () {
    console.log("Inside Cron");
    Transaction.find({ transactionStatus: "PENDING" }, function (err, transactions) {
        console.log(transactions);
        for (var i = 0; i < transactions.length; i++) {
            webClient.get("https://blockexplorer.com/api/tx/" + transactions[i].transactionId, function (data, resp) {
                console.log("Data Confirmations " + data.confirmations);
                if (data.confirmations > 0) {
                    console.log("Data from blockxplorer transaction is ");
                    console.log(data);
                    for (var j = 0; j < data.vout.length; j++) {
                        console.log("data.vout.lenghth is " + data.vout.length);
                        var voutAddressesFromTransaction = data.vout[j].scriptPubKey.addresses;
                        console.log(voutAddressesFromTransaction);
                        var outAddrIndex = 0;
                        for (var addressCount = 0; addressCount < voutAddressesFromTransaction.length; addressCount = addressCount + 1) {
                            var checkUser = userArray.find(x => x.userBtcId == voutAddressesFromTransaction[addressCount]);
                            if (checkUser !== undefined) {

                                console.log("Check user is defined");
                                console.log("Vin length is " + data.vin.length);
                                console.log(checkUser);
                                var receivedUser = receiverUserArray.find(x => x.receiverAddress == checkUser.userBtcId);
                                console.log("Sending message , fcmID " + receivedUser.receiverFCMId);
                                utility.sendTransactionReceivedNotificationMessage(receivedUser.receiverFCMId, data.vout[j].value, data.txid);
                                Transaction.findOne({ transactionId: data.txid }, function (err, transaction) {
                                    transaction.transactionStatus = "CONFIRMED";
                                    transaction.save();

                                });

                            }
                            outAddrIndex += 1;
                            console.log("Value of AddressCount is " + addressCount);
                        }
                    }
                }
            });
        }
    });
});

sendUnConfirmedTransactionNofyification.post(function (req, res) {
    var fcmId = req.body.fcmId;
    utility.sendTransactionUnConfirmedNotificationMessage(fcmId, "data.txid", "345.677");
});

sendConfirmedTransactionNofyification.post(function (req, res) {
    var fcmId = req.body.fcmId;
    utility.sendTransactionReceivedNotificationMessage(fcmId, '1234.987', 'c89cfb4c5a2bd79378293298fa1466960dbd0dab8d13e6e6331dd923837fb86b');
});

module.exports = router;