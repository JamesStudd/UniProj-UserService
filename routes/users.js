const express = require('express');
const { check, validationResult } = require('express-validator/check');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../database/models/userModel');
const creditCard = /^[0-9]{16}$/;

// Register form
router.get('/register', (req, res) => {
    res.send('Register');
});

// Register process
router.post('/register', [
    check('name').custom(value => {
        return User.findOne({value}).then(user => {
            if (user) {
                return Promise.reject('Name is already in use.');
            }
        });
    }),
    check('email').isEmail(),
    check('email').custom(value => {
        return User.findOne({value}).then(user => {
            if (user) {
                return Promise.reject('Email is already in use.');
            }
        });
    }),
    check('creditCardNumber').custom(value => {
        return IsCreditCardNumber(value);
    }),
    check('password').custom((value, {req}) => {
        return value === req.body.password2;
    })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    let cNumber = req.body.creditCardNumber.replace(/[- ]+/g, '');
    cNumber = parseInt(cNumber);
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        creditCardNumber: cNumber
    });

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
                return res.status(500).json({ errors: err});
            }
            newUser.password = hash;
            newUser.save((err) => {
                if (err) {
                    return res.status(500).json({ errors: err});
                }
                return res.status(201).json(newUser);
            });
        });
    });
});

function IsCreditCardNumber(str) {
    if (typeof str !== 'string')
        return;
    let sanitized = str.replace(/[- ]+/g, '');
    return creditCard.test(sanitized);
}

module.exports = router;