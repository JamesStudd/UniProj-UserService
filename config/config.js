var env = process.env.NODE_ENV || 'development';
const config = require('./databaseConfig');

if (env === 'development') {
    process.env.MONGODB_URI = 'mongodb://' + config.user + ':' + config.password + config.database;
} else if (env === 'test') {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/UsersServiceTest'
}