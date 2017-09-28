/**
 * Created by Tauqeer on 05-08-2016.
 */

// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var AdminConfigurationSchema = new mongoose.Schema({
    merchantProfit:Number,
    bitpointProfit:Number
});

// Export the Mongoose model
module.exports = mongoose.model('AdminConfiguration', AdminConfigurationSchema);