const mongoose = require('mongoose')

const mxm21HomeSchema = mongoose.Schema({
  type: String,
  nim: String,
  data: Object,
  date_time: String
})

const homeLogging = mongoose.model('mxm21-home-logging', mxm21HomeSchema)
module.exports = homeLogging
