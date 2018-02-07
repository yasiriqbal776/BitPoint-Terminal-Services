/**
 * Created by Tauqeer on 05-08-2016.
 */

// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var UserSchema = new mongoose.Schema({
    userName: String,
    minimumHotWalletBalance:Number,
    maximumHotWalletBalance:Number,
    userEmail: String,
    userFullName: String,
    userContactNumber: String,
    userPassword: String,
    userBtcId: String,
    hotWalletBenificiaryKey: String,
    userProfileStatus: Number,
    krakenAPIKey:String,
    krakenAPISecret:String,
    userAddress: String,
    userOccupation: String,
    hotWalletBalance:String,
    userAddress: String,
    userProfilePictureURL: String,
    BtcUserApplicationToken: String,
    BtcUserPasscode: String,
    BtcUserPasscodeStatus: Number,
    BtcUserLoginDetail: Object,
    transactionsByDays: Object,
    top2Transactions: Object,
    BtcUserDoubleAuthenticationMode: Number,
    BtcUserNotificationStatus: Number,
    userGCM: String,
    isEmailVerified: { type: Boolean, default: false },
    createdOnUTC: String,
    updatedOnUTC: String,
    userGUID: String,
    ethBalance: String,
    ethAddress: String,
    ethPrivateKey: String,
    ethPublicKey: String,
    token: String,
    channel: String,
    savedContacts: [],
    isUserMerchantMode: Number,
    lat:String,
    lng:String,
    bitcoinCurrencyRate:String,
    userRole:Number,
    tagLine: String,
    rating: Number,
    numberOfRatings: Number,
    averageRating: String,
    notificationsCount: Number,
    authenticationToken:String,
    profitWalletAddress:String,
    profitWalletUserName:String,
    profitWalletUserPassword:String,
    profitWalletKrakenBenificiaryKey:String,
    bitpointProfitWalletAddress:String,
    bitpointProfitWalletKrakenBenificiaryKey:String,
    merchantProfitMargin:Number,
    merchantProfitThreshold:Number,
    merchantProfit:Number,
    useKraken:Boolean
});

// Export the Mongoose model
module.exports = mongoose.model('BtcUser', UserSchema);