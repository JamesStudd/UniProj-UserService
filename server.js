require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const path = require('path');

const app = express();

let users = require('./routes/users');

InitAppUses();
InitAppRoutes();

app.listen(3000, () => {
    console.log('Listening on port 3000');
});

function InitAppUses() {
    app.use(expressValidator());

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    
    app.use(express.static('public'));

    app.set('view engine', 'pug')
}

function InitAppRoutes() {
    app.get('/', (req, res) => {
        res.render('index', {title: 'Users Service'});
    })

    app.use('/users', users);
    app.use('/docs', express.static(__dirname + '/doc'))
}

module.exports = {app};
