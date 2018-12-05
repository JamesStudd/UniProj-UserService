const bcrypt = require('bcryptjs');

let password = "mypassword";

bcrypt.genSalt(10, (err, salt) => {
    console.log("salt: " + salt);
    bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
            return res.status(500).json({ errors: err });
        }
        password = hash;

        bcrypt.compare("mypassword", password, (err, success) => {
            if (err) return console.log(err);
            console.log(success);
        })
    });
});

