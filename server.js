require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

const app = express();

let users = require('./routes/users');

InitAppUses();

app.listen(3000, () => {
    console.log('Listening on port 3000');
});

function InitAppUses() {
    app.use(expressValidator());

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.use('/users', users);
}

module.exports = {app};