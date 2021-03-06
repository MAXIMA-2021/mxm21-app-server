const LoginLogging = require('../models/loginLogging.model')
const AttendanceLogging = require('../models/stateAttendanceLogging.model')
const StateLogging = require('../models/stateLogging.model')
const HomeLogging = require('../models/homeLogging.model')
const ErrorLogging = require('../models/errorLogging.model')
const StudentEditLogging = require('../models/studentEditDataLogging.model')
const VerifyLogging = require('../models/verifyLogging.model')
const helper = require('../../helpers/helper')

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

exports.errorLogging = async (functions, services, err) => {
  try {
    const logging = new ErrorLogging({
      type: 'error',
      services: services,
      function: functions,
      error_message: err
    })

    await logging.save()
  } catch (err) {
    console.log(err)
  }
}

exports.studentEditLogging = async (type, nim_panit, nim_maba, data) => {
  try {
    const logging = new StudentEditLogging({
      type: type,
      nim_panit: nim_panit,
      nim_maba: nim_maba,
      data: data
    })

    await logging.save()
  } catch (err) {
    console.log(err)
  }
}

exports.verificationAccount = async (type, nim_verifying, nim_isVerified, status) => {
  try {
    const logging = new VerifyLogging({
      type: type,
      verifying: `${nim_verifying}`,
      isVerified: nim_isVerified,
      verify: `${status}`,
      time: helper.createAttendanceTime()
    })

    await logging.save()
  } catch (err) {
    console.log(err)
  }
}
