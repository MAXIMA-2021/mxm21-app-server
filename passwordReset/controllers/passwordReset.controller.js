const passwordReset = require('../models/passwordReset.model')
const logging = require('../../mongoose/controllers/logging.mongoose')
const helper = require('../../helpers/helper')
const panitia = require('../../user/models/panitia.model')
const organizator = require('../../user/models/organizator.model')

exports.getPasswordReset = async (req, res) => {
  const { nim } = req.params

  let result

  try {
    if (nim !== undefined) {
      result = await passwordReset.query().where({ nim })
    }
    result = await passwordReset.query()
    return res.status(200).send(result)
  } catch (err) {
    logging.errorLogging('getPasswordReset', 'PasswordReset', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.createPasswordReset = async (req, res) => {
  const { nim } = req.body

  try {
    const checkPanitia = await panitia.query().where({ nim })

    const checkOrganizator = await organizator.query().where({ nim })

    if (checkPanitia.length === 0 && checkOrganizator.length === 0) {
      return res.status(404).send({
        message: 'Akun Tidak Ditemukan'
      })
    }

    await passwordReset.query().insert({
      nim,
      otp: helper.createOTP(),
      expired: 0,
      requestDate: helper.createAttendanceTime()
    })

    return res.status(200).send({
      message: 'password reset!!',
      otp: helper.createOTP()
    })
  } catch (err) {
    logging.errorLogging('createPasswordReset', 'PasswordReset', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.verifyOtp = async (req, res) => {
  const { otp } = req.body

  try {
    const checkOTP = await passwordReset.query().where({ otp })

    if (checkOTP.length !== 0) {
      return res.status(401).send({
        message: 'OTP Invalid'
      })
    }

    return res.status(200).send({
      otp: true
    })
  } catch (err) {
    logging.errorLogging('verifyOTP', 'PasswordReset', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}
