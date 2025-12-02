const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const UserSchema = new Schema({
    airtableUserId: { type: String, required: true, unique: true },
    profile: { type: Object },
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    tokenExpiresAt: { type: Date },
    lastLoginAt: { type: Date, default: Date.now }
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);