const mongoose = require('mongoose')

const mxm21ErrorSchema = mongoose.Schema({
  type: String,
  services: String,
  function: String,
  error_message: String
})

const errorLogging = mongoose.model('mxm21-error-logging', mxm21ErrorSchema)
module.exports = errorLogging
