const mongoose = require('mongoose');
const config = require('../config/databaseConfig');

mongoose.connect(config.database);

module.exports = mongoose;