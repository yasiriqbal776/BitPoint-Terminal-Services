/**
 * Created by Tauqeer on 05-08-2016.
 */

// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var ProfitSchema = new mongoose.Schema({
    merchantId:String,
    customerAddress:String,
    profitTotal:Number,
    profitBitpoint:Number,
    profitMerchant:Number,
    transactionId:String,
    profitTime:Number,
    profitType:String
});

// Export the Mongoose model
module.exports = mongoose.model('Profit', ProfitSchema);