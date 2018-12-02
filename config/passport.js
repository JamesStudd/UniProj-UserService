const LocalStrategy = require('passport-local').Strategy;
const User = require('../database/models/userModel');
const database = require('../database/database');
const bcrypt = require('bcryptjs');

module.exports = function (passport) {
    // Local strategy
    passport.use(new LocalStrategy(function (username, password, done) {
        // Match name
        let query = {username: username};
        User.findOne(query, function(err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {message: 'Incorrect credentials.'});
            }

            // Match password
            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done (null, user);
                } else {
                    return done(null, false, {message: 'Incorrect credentials'});
                }
            });
        });
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        })
    })
}