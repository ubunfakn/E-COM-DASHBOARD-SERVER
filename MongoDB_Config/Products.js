const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    brand: String,
    userId: String
})

const Product = mongoose.model('Products', productSchema);
module.exports = Product;