const mongoose = require('mongoose');


mongoose.connect(process.env.MONGODB_URI, (err) => {
    if (err) {
        console.error('Database error, please check credentials and restart server.');
    } 
});

module.exports = mongoose;

