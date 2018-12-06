const express = require('express');
const { check, validationResult } = require('express-validator/check');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verify = require('./../auth/verify');
const _ = require('lodash');

const User = require('../database/models/userModel');
const validation = require('./../utils/validation');
const jwtConfig = require('./../config/jwtConfig');

// Register form
router.get('/list', verify.Admin, (req, res) => {
    User.find({}, function (err, users) {
        if (err) {
            console.log(err);
            return;
        }
        if (users) {
            res.status(200).send(users);
        } else {
            res.status(404);
        }
    });
});

// Register process
router.post('/register', [
    check('username').not().isEmpty().withMessage('Name is a required field.'),
    check('username').custom(value => {
        return User.findOne({ username: value }).then(user => {
            if (user) {
                return Promise.reject('Username is already in use.');
            } else {
                return true;
            }
        });
    }),
    check('email').not().isEmpty().withMessage('Email is a required field.'),
    check('email').custom(value => {
        if (!validation.isEmail(value.toString())) {
            return Promise.reject('Invalid email address.')
        } else { 
            return true;
        }
    }),
    check('email').custom(value => {
        return User.findOne({ email: value }).then(user => {
            if (user) {
                return Promise.reject('Email is already in use.');
            } else {
                return true;
            }
        });
    }),
    check('creditCardNumber').not().isEmpty().withMessage('Credit Card Number is a required field.'),
    check('creditCardNumber').custom(value => {
        if (!validation.isCreditCardNumber(value.toString())) {
            return Promise.reject('Invalid credit card number.');
        } else {
            return true;
        }
    }),
    check('password').not().isEmpty().withMessage('Password is a required field.'),
    check('password2').not().isEmpty().withMessage('Password confirmation is a required field.'),
    check('password').custom((value, { req }) => {
        if (req.body.password2 && value && value != req.body.password2) {
            return Promise.reject('Passwords must match.');
        } else {
            return true;
        }
    }),
], (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length > 0) {
        return res.status(400).send(errors.array());
    }
    let cNumber = req.body.creditCardNumber.toString().replace(/[- ]+/g, '');
    cNumber = parseInt(cNumber);

    let userLevel = req.body.userLevel || 0;

    let newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        creditCardNumber: cNumber,
        userLevel: userLevel
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
                
                let token = jwt.sign({id: newUser._id}, jwtConfig.secret, {
                    expiresIn: 86400 // Expires in 24 hours
                });

                res.status(200).send({auth: true, token: token, user: newUser});
            });
        });
    });
});

// login post route
router.post('/login', (req, res) => {
    User.findOne({username: req.body.username}, (err, user) => {
        if (err) return res.status(500).send('Error on the server');
        if (!user) return res.status(404).send('No user found');

        let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({auth: false, token: null});

        let token = jwt.sign({id:user._id, userLevel: user.userLevel}, jwtConfig.secret, {
            expiresIn: 86400 // Expires in 24 hours
        });

        res.status(200).send({auth: true, token: token});
    })
});


// Logout
router.get('/logout', function (req, res) {
    res.status(200).send({auth: false, token: null});
});

router.get('/me', verify.Token, (req, res) => {
    // Password: 0 is a projection
    User.findById(req.userId, { password: 0 }, (err, user) => {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found");

        res.status(200).send(user);
    })
})

router.post('/me', verify.Token, (req, res) => {
    User.findById(req.userId, (err, user) => {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found");

        let initialState = _.cloneDeep(user);

        if (req.body.email && validation.isEmail(req.body.email)) {
            user.email = req.body.email;
        }

        if (req.body.creditCardNumber && validation.isCreditCardNumber(req.body.creditCardNumber)) {
            user.creditCardNumber = req.body.creditCardNumber;
        }

        if (!_.isEqual(initialState, user)) {
            user.save((err) => {
                if (err) {
                    return res.status(500).json({ errors: err });
                }
                res.status(200).send(user);
            })
        } else {
            res.status(200).send(user);
        }
    });
});

router.get('/:username', verify.Admin, function (req, res) {
    User.findOne({username: req.params.username}, {password: 0}, function (err, user) {
        if (err) {
            return res.status(500);
        }
        if (user) {
            res.status(200).send(user);
        } else {
            res.status(404).send();
        }
    });
});

module.exports = router;