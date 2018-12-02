const express = require('express');
const { check, validationResult } = require('express-validator/check');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../database/models/userModel');
const creditCard = /^[0-9]{16}$/;

// Register form
router.get('/list', (req, res) => {
    User.find({}, function (err, users) {
        if (err) {
            console.log(err);
            return;
        }
        if (users) {
            res.render('viewUsers', { users });
        }
    });
});

// Register Get
router.get('/register', (req, res) => {
    res.render('users/register');
});

// Register process
router.post('/register', [
    check('username').not().isEmpty().withMessage('Name is a required field.'),
    check('username').custom(value => {
        return User.findOne({ value }).then(user => {
            if (user) {
                return Promise.reject('Username is already in use.');
            } else {
                return true;
            }
        });
    }),
    check('email').not().isEmpty().withMessage('Email is a required field.'),
    check('email').custom(value => {
        return User.findOne({ value }).then(user => {
            if (user) {
                return Promise.reject('Email is already in use.');
            } else {
                return true;
            }
        });
    }),
    check('creditCardNumber').not().isEmpty().withMessage('Credit Card Number is a required field.'),
    check('creditCardNumber').custom(value => {
        if (!IsCreditCardNumber(value)) {
            return Promise.reject('Invalid credit card number.');
        } else {
            return true;
        }
    }),
    check('password').not().isEmpty().withMessage('Password is a required field.'),
    check('password').custom((value, { req }) => {
        if (req.body.password2 && value && value != req.body.password2) {
            return Promise.reject('Passwords must match.');
        } else {
            return true;
        }
    }),
    check('password2').not().isEmpty().withMessage('Password confirmation is a required field.')
], (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
        return res.render('users/register', {
            errors: errors.array()
        });
    }
    let cNumber = req.body.creditCardNumber.replace(/[- ]+/g, '');
    cNumber = parseInt(cNumber);
    let newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        creditCardNumber: cNumber
    });

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
                return res.status(500).json({ errors: err });
            }
            newUser.password = hash;
            newUser.save((err) => {
                if (err) {
                    return res.status(500).json({ errors: err });
                }
                req.flash('success', 'You are now registed and can log in');
                res.redirect('/users/login');
            });
        });
    });
});

// Login Get
router.get('/login', (req, res) => {
    res.render('users/login');
});


// login post route
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'You are logged out.');
    res.redirect('/');
});

router.get('/done', function (req, res) {
    res.render('singleUser');
});


function IsCreditCardNumber(str) {
    if (typeof str !== 'string')
        return;
    let sanitized = str.replace(/[- ]+/g, '');
    return creditCard.test(sanitized);
}

module.exports = router;