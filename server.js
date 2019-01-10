require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

const app = express();

let users = require('./routes/users');

// Heroku changes the process.env.PORT, allow it to do that
// If we aren't using heroku, just use port 3000
const port = process.env.PORT || 3000;

InitAppUses();
InitAppRoutes();

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

function InitAppUses() {
    // Validate the req.body that gets passed to get and post functions
    app.use(expressValidator());

    // Another piece of middleware to check the body of a request
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    
    // Serve the public directory up to access bootstrap
    app.use(express.static('public'));

    // Set the view engine to pug templating engine
    app.set('view engine', 'pug')
}

function InitAppRoutes() {
    // Simple home page to validate the service is up and running
    app.get('/', (req, res) => {
        res.render('index', {title: 'Users Service'});
    })

    // Any /users route should be using the users router
    app.use('/users', users);

    // websiteroot/docs will direct to the public/doc index.html
    app.use('/docs', express.static(__dirname + '/doc'))
}

module.exports = {app};
