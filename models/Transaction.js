/**
 * Created by Tauqeer on 05-08-2016.
 */

// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var TransactionSchema = new mongoose.Schema({
    merchantId:String,
    customerAddress:String,
    sendingAmount:Number,
    transactionId:String,
    transactionTime:Number,
    transactionType:String,
    transactionStatus:String
});

// Export the Mongoose model
module.exports = mongoose.model('Transaction', TransactionSchema);