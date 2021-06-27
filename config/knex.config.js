var environment = process.env.NODE_ENV || 'development'
var config = require('./knexfile.config.js')[environment]

module.exports = require('knex')(config) 