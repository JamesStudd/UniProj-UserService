const mongoose = require('../database');

let userSchema = mongoose.Schema({
    name: {
        type: String,
        requires: true
    },
    email:{
        type: String,
        requires: true
    },
    password:{
        type: String,
        requires: true
    },
    creditCardNumber:{
        type: Number,
        requires: true
    }
});

var User = mongoose.model("User", userSchema);

module.exports = User;