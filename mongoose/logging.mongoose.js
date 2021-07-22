const LoginLogging = require('../user/models/loginLogging.model')
const AttendanceLogging = require('../state/models/stateAttendanceLogging.model')
const StateLogging = require('../state/models/stateLogging.model')
const HomeLogging = require('../home/models/homeLogging.model')
const ErrorLogging = require('./model/error.model')
const helper = require('../helpers/helper')

exports.loginLogging = async (nim, ip) => {
  try {
    const login = new LoginLogging({
      type: 'jwt-issue',
      nim: nim,
      ip_address: ip,
      date_time: helper.createAttendanceTime()
    })
    await login.save()
  } catch (err) {
    console.log(err)
  }
}

exports.attendancelogging = async (type, nim_panit, nim, stateID, inEventAttendance) => {
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

exports.stateLogging = async (type, nim, data, date_time) => {
  try {
    const logging = new StateLogging({
      type: type,
      nim: nim,
      data: data,
      date_time: date_time
    })

    await logging.save()
  } catch (err) {
    console.log(err)
  }
}

exports.homeLogging = async (type, nim, data, date_time) => {
  try {
    const logging = new HomeLogging({
      type: type,
      nim: nim,
      data: data,
      date_time: date_time
    })

    await logging.save()
  } catch (err) {
    console.log(err)
  }
}

exports.errorLogging = async (type, err) => {
  try {
    const logging = new ErrorLogging({
      type: type,
      error: err
    })

    await logging.save()
  } catch (err) {
    console.log(err)
  }
}
