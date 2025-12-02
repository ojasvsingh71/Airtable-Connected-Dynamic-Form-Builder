const jwt = require('jsonwebtoken');


function sign(user) {
    return jwt.sign({ id: user._id, airtableUserId: user.airtableUserId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}


module.exports = { sign };