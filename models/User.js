//models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true // Permite que varios documentos tengan googleId nulo
    },
    name: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    photo: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);