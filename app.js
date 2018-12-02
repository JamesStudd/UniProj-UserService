require('./config/config');
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

    // Express Messages middleware
    app.use(require('connect-flash')());
    app.use(function (req, res, next) {
        res.locals.messages = require('express-messages')(req, res);
        next();
    });

    require('./config/passport')(passport);
    app.use(passport.initialize());
    app.use(passport.session());

    app.get('*', function (req, res, next) {
        res.locals.user = req.user || null;
        next();
    })

    app.use(expressValidator());

    app.set('view engine', 'pug');
    app.set('views', './views');

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.use(upload.array());
    app.use(express.static('public'));

    app.use(flash());

    app.use('/users', users);
}

function InitAppRoutes() {
    app.get('/', (req, res) => {
        res.render('index');
    });
}

module.exports = {app};