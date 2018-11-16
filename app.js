const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();
const upload = multer();

let users = require('./routes/users');

InitAppUses();
InitAppRoutes();

app.listen(3000, () => {
    console.log('Listening on port 3000');
});

function InitAppUses() {
    app.use(session({
        secret: 'Temp Secret',
        resave: true,
        saveUninitialized: true
    }));

    app.use(expressValidator());

    app.set('view engine', 'pug');
    app.set('views', './views');

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    app.use(upload.array());
    app.use(express.static('public'));

    app.use(flash());

    app.use('/users', users);
}

function InitAppRoutes() {
    app.get('/', (req, res) => {
        res.render('index', {title: 'Home', message: 'List of users'});
    });
}