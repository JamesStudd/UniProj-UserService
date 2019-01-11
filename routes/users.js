const express = require('express');
const { check, validationResult } = require('express-validator/check');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verify = require('./../auth/verify');
const _ = require('lodash');
const nodemailer = require('nodemailer');

const User = require('../database/models/userModel');
const mongoose = require('mongoose');
const validation = require('./../utils/validation');
const jwtConfig = require('./../config/jwtConfig');

// If Mongo isn't connected, show the user a disconnected page
router.get('*', (req, res, next) => {
    if(mongoose.connection.readyState != 1) {
        res.render('503');
    } else {
        next();
    }
})

// Register Form
router.get('/register', (req, res) => {
    res.render('register');
})

/**
 * @api {get} /users/list Request all users
 * @apiName GetList
 * @apiGroup User
 * @apiVersion 1.0.0
 * 
 * @apiPermission admin/staff
 * 
 * @apiSuccess {Array} Users Array of user objects
 * @apiSuccessExample Example data on success:
 *  [
 *      {
 *          "id": "Some Object ID",
 *          "username": "Some Username",
 *          "email": "Some Email",
 *          "userLevel": 0/1/2
 *      },
 *      {
 *          "id": "Some Other Object ID",
 *          "username": "Some Other Username",
 *          "email": "Another Email",
 *          "userLevel": 0/1/2
 *      }
 *  ]
 * 
 * @apiError Auth No token provided
 */
router.get('/list', verify.Admin, (req, res) => {
    User.find({}, { password: 0, creditCardNumber: 0 }, function (err, users) {
        if (err) {
            console.log(err);
            return res.status(400).send(err);
        }
        if (users) {
            res.status(200).send(users);
        } else {
            res.status(404);
        }
    });
});

/**
 * @api {post} /users/register Register a user
 * @apiName Register
 * @apiGroup User
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} username 
 * @apiParam {String} email
 * @apiParam {String} creditCardNumber Format must be nnnnnnnnnnnnnnnn or nnnn-nnnn-nnnn-nnnn
 * @apiParam {String} password
 * @apiParam {String} password2 Must match 'password' field
 * 
 * @apiParamExample {json} Request-Example:
 *  {
 *      "username": "James",
 *      "email": "James@live.com",
 *      "creditCardNumber": "1234-5678-9012-3456"
 *      "password": "hunter2",
 *      "password2": "hunter2"
 *  }
 * 
 * @apiSuccess {JSON} Result Auth, Token and User object
 * @apiSuccessExample Example data on success:
 *  {
 *      "auth": true,
 *      "token": "Some Generated Token",
 *      "user": {
 *          "id": "Some Object ID",
 *          "username": "James",
 *          "email": "James@live.com",
 *          "creditCardNumber": 1234567890123456,
 *          "password": "some hashed and salted password"
 *      }
 *  }
 */
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

                let token = jwt.sign({ id: newUser._id }, jwtConfig.secret, {
                    expiresIn: 86400 // Expires in 24 hours
                });

                res.status(200).send({ auth: true, token: token, user: newUser, expiresIn: 86400 });
            });
        });
    });
});

// Login get route
router.get('/login', (req, res) => {
    res.render('login');
})

/**
 * @api {post} /users/login Login a user
 * @apiName Login
 * @apiGroup User
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} username 
 * @apiParam {String} password
 * 
 * @apiParamExample {json} Request-Example:
 *  {
 *      "username": "James",
 *      "password": "hunter2"
 *  }
 * 
 * @apiSuccess {JSON} Result Auth and a token
 * @apiSuccessExample Example data on success:
 *  {
 *      "auth": true,
 *      "token": "Some Generated Token"
 *  }
 */
router.post('/login', (req, res) => {
    User.findOne({ username: req.body.username }, (err, user) => {
        if (err) return res.status(500).send('Error on the server');
        if (!user) return res.status(404).send('No user found');

        let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

        let token = jwt.sign({ id: user._id, userLevel: user.userLevel }, jwtConfig.secret, {
            expiresIn: 86400 // Expires in 24 hours
        });
        res.cookie('auth', token);
        res.status(200).send({ auth: true, token: token, expiresIn: 86400 });
    })
});

/**
 * @api {get} /users/logout Logout current user
 * @apiName Logout
 * @apiGroup User
 * @apiVersion 1.0.0
 * 
 * @apiSuccess {JSON} Result Auth false and null token
 */
router.get('/logout', function (req, res) {
    res.status(200).send({ auth: false, token: null });
});

/**
 * @api {get} /users/me Get current logged in user
 * @apiName GetMe
 * @apiGroup User
 * @apiVersion 1.0.0
 * 
 * @apiPermission Logged in
 * 
 * @apiError UserNotFound The <code>userId</code> could not be found.
 * 
 * @apiSuccess {JSON} User User Object
 * @apiSuccessExample Example data on success:
 *  {
 *      "id": "Some Object ID",
 *      "username": "Some Username",
 *      "email": "Eome Email",
 *      "creditCardNumber": 1234567890123456
 *  }
 */
router.get('/me', verify.Token, (req, res) => {
    // Password: 0 is a projection
    User.findById(req.userId, { password: 0 }, (err, user) => {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found");

        res.status(200).send(user);
    })
})

/**
 * @api {post} /users/me Change the email or creditCardNumber of a user
 * @apiName PostMe
 * @apiGroup User
 * @apiVersion 1.0.0
 * 
 * @apiPermission Logged in
 * 
 * @apiParam {String} [email]
 * @apiParam {String} [creditCardNumber] Format must be nnnnnnnnnnnnnnnn or nnnn-nnnn-nnnn-nnnn
 * 
 * @apiParamExample {JSON} Request-Example:
 *  {
 *      "email": "JamesNew@live.com",
 *      "creditCardNumber": "1111-2222-3333-4444"
 *  }
 * 
 * @apiSuccess {JSON} User User Object
 * @apiSuccessExample Example data on success:
 *  {
 *      "id": "Some Object ID",
 *      "username": "Some Username",
 *      "email": "Some Changed Email",
 *      "creditCardNumber": "Some Changed Credit Card Number",
 *      "password": "Some Hashed Password"
 *  }
 */
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

router.get('/invite', (req, res) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, jwtConfig.secret, (err, decoded) => {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        }

        req.userId = decoded.id;
        User.findById(req.userId, (err, user) => {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token' });
            if (!user) return res.status(404).send("No user found");

            res.render('invite', {
                token: token,
                sender: user.username
            })
        })
    })
});

/**
 * @api {post} /users/invite/:username Sends an email to a recipient
 * @apiName SendInviteEmail
 * @apiGroup User
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} name
 * @apiParam {String} email
 * @apiParam {String} [customMessage]
 * 
 * @apiParamExample {JSON} Request-Example:
 *  {
 *      "name": "James",
 *      "email": "James@email.com"
 *      "customMessage": "Hey James, come join this awesome website!"
 *  }
 * 
 */
router.post('/invite/:email', verify.Token, (req, res) => {
    if (!req.body.name || !req.body.email || !validation.isEmail(req.body.email))
        return res.status(300).send({ error: 'Invalid name or email' })

    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'Email@gmail.com',
            pass: '********'
        }
    });

    let mailOptions = {
        from: '"Name" <Email@Email.com>',
        to: req.body.email,
        subject: `${req.query.sender} has invited you to ThreeAmigos!`,
        text: 'Hi ' + req.body.name + ',\n' + req.body.customMessage + '\nTo join, visit www.threeamigos.com to sign up!'
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(400).send({error: 'Internal server error.'});
        }
        res.redirect('/');
    })
})

/**
 * @api {get} /users/singleUser/:username Get the details of any user
 * @apiName GetUserByUsername
 * @apiGroup User
 * @apiVersion 1.0.0
 * 
 * @apiPermission admin/staff
 * 
 * @apiParam {String} username
 * 
 * @apiParamExample {JSON} Request-Example:
 *  {
 *      "username": "Some Username"
 *  }
 * 
 * @apiSuccess {JSON} User User Object
 * @apiSuccessExample Example data on success:
 *  {
 *      "id": "Some Object ID",
 *      "username": "Some Username",
 *      "email": "Some Email",
 *      "creditCardNumber": "Some Credit Card Number",
 *  }
 */
router.get('/singleUser/:username', verify.Admin, function (req, res) {
    User.findOne({ username: req.params.username }, { password: 0, creditCardNumber: 0 }, function (err, user) {
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