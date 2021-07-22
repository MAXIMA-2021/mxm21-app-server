const mongoose = require('mongoose')

const mxm21StateSchema = mongoose.Schema({
  type: String,
  nim: String,
  data: Object,
  date_time: String
})

const stateLogging = mongoose.model('mxm21-state-information-logging', mxm21StateSchema)
module.exports = stateLogging
