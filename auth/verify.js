const jwt = require('jsonwebtoken');
const config = require('./../config/jwtConfig');
const User = require('./../database/models/userModel');

function token(req, res, next) {
    let token = req.headers['x-access-token'];
    if (!token) return res.status(403).send({auth: false, message: 'No token provided.'});

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err)
            return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});
        req.userId = decoded.id;
        next();
    })
}

function admin(req, res, next) {
    let token = req.headers['x-access-token'];
    if (!token) return res.status(403).send({auth: false, message: 'No token provided.'});

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err)
            return res.status(500).send({auth: false, message: 'Failed to authenticate token.'});
        req.userId = decoded.id;
        User.findById(req.userId, (err, user) => {
            if (err) return res.status(500).send({auth: false, message: 'Failed to authenticate token'});
            if (!user) return res.status(404).send("No user found");

            if (user.userLevel > 0) {
                next();
            } else {
                return res.status(401).send({auth: false, message: 'Unauthorized to view this content.'});
            }
        });
    })
}

module.exports.Token = token;
module.exports.Admin = admin;