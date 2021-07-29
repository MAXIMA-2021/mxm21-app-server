const AttendanceLogging = require('../models/stateAttendanceLogging.model')

exports.logging = async (type, nim_panit, nim, stateID, inEventAttendance) => {
  try {
    const attendance = new AttendanceLogging({
      type: type,
      nim_panit: nim_panit,
      nim_maba: nim,
      stateID: stateID,
      newValue: inEventAttendance
    })
    await attendance.save()
  } catch (err) {
    console.log(err)
  }
}
