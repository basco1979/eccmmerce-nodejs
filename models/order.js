const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    name : String,
    image : String,
    countInStock : Number
});

exports.Order = mongoose.model('order', orderSchema);