const mongoose = require('mongoose');
const config = require('../config/databaseConfig');

mongoose.connect(process.env.MONGODB_URI);

module.exports = mongoose;