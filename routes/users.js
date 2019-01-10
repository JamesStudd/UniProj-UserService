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

// Register Form
router.get('/register', (req, res) => {
    res.render('register');
})

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
                
                let token = jwt.sign({id: newUser._id}, jwtConfig.secret, {
                    expiresIn: 86400 // Expires in 24 hours
                });

                res.status(200).send({auth: true, token: token, user: newUser});
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

/**
 * @api {get} /users/logout Logout current user
 * @apiName Logout
 * @apiGroup User
 * @apiVersion 1.0.0
 * 
 * @apiSuccess {JSON} Result Auth false and null token
 */
router.get('/logout', function (req, res) {
    res.status(200).send({auth: false, token: null});
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

/**
 * @api {get} /users/:username Get the details of any user
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
router.get('/:username', verify.Admin, function (req, res) {
    User.findOne({username: req.params.username}, {password: 0, creditCardNumber: 0}, function (err, user) {
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

/**
 * @api {delete} /users/:username Delete a user
 * @apiName DeleteUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * 
 * @apiPermission admin/staff
 * 
 * @apiParam {String} userName Username to be deleted
 * 
 * @apiParamExample {JSON} Request-Example:
 *  {
 *      "userName": "userNameToDelete"
 *  }
 * 
 * @apiSuccess {JSON} Result Object to say who was deleted
 * 
 * @apiSuccessExample Example data on success:
 *  {
 *      "deleted": true,
 *      "status": "User deleted",
 *      "username": "usernamePassedIn"
 *  }
 */
router.delete('/:username', verify.Admin, (req, res) => {
    User.deleteOne({username: req.params.username}, (err, user) => {
        if (err) {
            return res.status(500);
        } else {
            return res.status(200).send({deleted: true, status: 'User deleted', username: req.params.username})
        }
    });
})

/**
 * @api {post} /users/admin/:username Change the user level of any user
 * @apiName ChangeUserLevel
 * @apiGroup User
 * @apiVersion 1.0.0
 * 
 * @apiPermission admin/staff
 * 
 * @apiError Error <code>userLevel</code> must be a number that is 0, 1 or 2.
 * 
 * @apiParam {Int} userLevel Integer that is 0, 1 or 2
 * 
 * @apiParamExample {JSON} Request-Example:
 *  {
 *      "userLevel": 0/1/2
 *  }
 * 
 * @apiSuccess {JSON} User User Object
 * @apiSuccessExample Example data on success:
 *  {
 *      "id": "Some Object ID",
 *      "username": "Some Username",
 *      "email": "Some Email",
 *      "userLevel": "A New UserLevel" 
 *  }
 */
router.post('/admin/:username', verify.Admin, (req, res) => {

    let newLevel = req.body.userLevel;
    let parsedLevel = Number.parseInt(newLevel);

    if (!newLevel || isNaN(parsedLevel) || parsedLevel < 0 || parsedLevel > 2) {
        return res.status(400).send({error: "userLevel must be a number that is 0, 1 or 2."})
    }

    User.findOne({username: req.params.username}, {password: 0, creditCardNumber: 0}, (err, user) => {
        if (err) {
            return res.status(500);
        }
        if (user) {
            user.userLevel = parsedLevel;
            user.save((err) => {
                if (err) {
                    return res.status(500).json({ errors: err });
                }
                res.status(200).send(user);
            });
        } else {
            return res.status(400).send();
        }
    })
})

module.exports = router;