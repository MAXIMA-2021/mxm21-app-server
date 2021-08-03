const mongoose = require('mongoose')

const mxm21EditDataSchema = mongoose.Schema({
  type: String,
  nim_panit: String,
  nim_maba: String,
  data: Object
})

const studentEditDataLogging = mongoose.model('mxm21-student-edit-data-logging', mxm21EditDataSchema)
module.exports = studentEditDataLogging
