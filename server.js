require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

const app = express();

let users = require('./routes/users');
const port = process.env.PORT || 3000;

InitAppUses();
InitAppRoutes();

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
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
