const mongoose = require('mongoose')

const mxm21ErrorSchema = mongoose.Schema({
  type: String,
  error: String
})

const errorLogging = mongoose.model('mxm21-error-logging', mxm21ErrorSchema)
module.exports = errorLogging
