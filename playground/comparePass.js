const bcrypt = require('bcryptjs');

let password = "mypassword";

bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
            return res.status(500).json({ errors: err });
        }
        password = hash;
    });
});

console.log(password);

bcrypt.compare("mypassword", password, (err, success) => {
    if (err) return console.log(err);
    console.log(success);
})