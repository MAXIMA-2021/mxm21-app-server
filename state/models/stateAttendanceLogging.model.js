const mongoose = require('mongoose')

const mxm21StateAttendance = mongoose.Schema({
  type: String,
  nim_panit: String,
  nim_maba: String,
  stateID: Number,
  newValue: Boolean
})

const stateAttendanceLogging = mongoose.model('mxm21-state-attendance-logging', mxm21StateAttendance)
module.exports = stateAttendanceLogging
