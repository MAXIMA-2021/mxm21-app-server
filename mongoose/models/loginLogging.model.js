const mongoose = require('mongoose')

const mxm21LoginSchema = mongoose.Schema({
  type: String,
  nim: String,
  ip_address: String,
  date_time: String
})

const loginLogging = mongoose.model('mxm21-login-logging', mxm21LoginSchema)
module.exports = loginLogging
