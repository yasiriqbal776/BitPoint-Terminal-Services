/**
 * Created by Tauqeer on 05-08-2016.
 */

// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var ReceiverBalanceSchema = new mongoose.Schema({
    receiverAddress:String,
    receiverFCMId:String
});

// Export the Mongoose model
module.exports = mongoose.model('ReceiverBalance', ReceiverBalanceSchema);