const express = require('express');
const router = express.Router();
const verify = require('../auth/verify');
const config = require('../config/jwtConfig');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const User = require('../database/models/userModel');

router.get('*', (req, res, next) => {
    if(mongoose.connection.readyState != 1) {
        res.render('503');
    } else {
        next();
    }
})

router.get('/', (req, res) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (!token) return res.status(403).send({auth: false, message: 'No token provided.'});

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            console.log(err);
            return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});
        }       
        req.userId = decoded.id;
        User.findById(req.userId, (err, user) => {
            if (err) return res.status(500).send({auth: false, message: 'Failed to authenticate token'});
            if (!user) return res.status(404).send("No user found");

            if (user.userLevel > 0) {

                User.find({}, { password: 0, creditCardNumber: 0 }, function (err, users) {
                    if (err) {
                        console.log(err);
                        return res.status(400).send(err);
                    }
                    if (users) {
                        
                        res.render('admin/index', {
                            admin: user,
                            allUsers: users,
                            token: token
                        })

                    } else {
                        res.status(404);
                    }
                });
            } else {
                return res.status(401).send({auth: false, message: 'Unauthorized to view this content.'});
            }
        });
    })
})

/**
 * @api {post} /admin/:username Change the user level of any user
 * @apiName ChangeUserLevel
 * @apiGroup Admin
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
router.post('/:username', verify.Admin, (req, res) => {

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

/**
 * @api {delete} /admin/delete/:username Delete a user
 * @apiName DeleteUser
 * @apiGroup Admin
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
router.post('/delete/:username', verify.Admin, (req, res) => {
    User.findOneAndDelete({username: req.params.username}, {projection: {password: 0, creditCardNumber: 0}}, (err, user) => {
        if (err) {
            return res.status(500);
        } else {
            if (user) {
                return res.status(200).send({deleted: true, status: 'User deleted', username: req.params.username})
            }
            return res.status(404).send()
        }
    });
})

module.exports = router;