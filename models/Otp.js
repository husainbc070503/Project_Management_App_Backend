const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    email: String,

    otp: {
        type: Number,
        default: 0,
    },

    expiresIn: Number,

    requestedOn: {
        type: Date,
        default: Date.now()
    }

}, { timestamps: true });

const Otp = mongoose.model('otp', OtpSchema);

module.exports = Otp