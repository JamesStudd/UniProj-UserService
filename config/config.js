var env = process.env.NODE_ENV || 'development';
const config = require('./databaseConfig');

if (env === 'development') {
    process.env.MONGODB_URI = `mongodb://${config.development.user}:${config.development.password}${config.development.database}`;
} else if (env === 'test') {
    process.env.MONGODB_URI = `mongodb://${config.testing.user}:${config.testing.password}${config.testing.database}`;
}