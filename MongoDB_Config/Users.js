const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    email: String, 
    password: String,
    mobile: String
})

const User = new mongoose.model('Users', userSchema);

module.exports = User