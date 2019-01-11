const mongoose = require('../database');

var User = undefined;

if (mongoose.connection && mongoose.connection.readyState == 1 || mongoose.connection.readyState == 2) {
    let userSchema = mongoose.Schema({
        username: {
            type: String,
            required: true
        },
        email:{
            type: String,
            required: true
        },
        password:{
            type: String,
            required: true
        },
        creditCardNumber:{
            type: Number,
            required: true
        },
        userLevel: {
            type: Number, // 0 Normal user, 1 Staff, 2 Manager
            required: true,
            default: 0
        }
    });
    
    User = mongoose.model("User", userSchema);
}

module.exports = User;