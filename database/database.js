const mongoose = require('mongoose');
const config = require('../config/databaseConfig');

mongoose.connect('mongodb://'+config.user+':'+config.password+config.database);

module.exports = mongoose;