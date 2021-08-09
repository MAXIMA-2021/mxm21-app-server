const passwordReset = require('../models/passwordReset.model')
const logging = require('../../mongoose/controllers/logging.mongoose')
const helper = require('../../helpers/helper')
const panitia = require('../../user/models/panitia.model')
const organizator = require('../../user/models/organizator.model')
const bcrypt = require('bcryptjs')

exports.getPasswordReset = async (req, res) => {
  const { nim } = req.query

  let result

  try {
    if (nim !== undefined) {
      result = await passwordReset.query().where({ nim })
    } else {
      result = await passwordReset.query()
    }
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

  const otp = helper.createOTP()

  let role

  try {
    const dbPanitia = await panitia.query().where({ nim })

    const dbOrganizator = await organizator.query().where({ nim })

    switch (true) {
      case dbPanitia.length !== 0 :
        role = 'panitia'
        break
      case dbOrganizator.length !== 0 :
        role = 'panitia'
        break
      case dbPanitia.length === 0 && dbOrganizator.length === 0 :
        return res.status(400).send({
          message: 'Akun tidak ditemukan atau belum terdaftar'
        })
    }

    await passwordReset.query().insert({
      nim,
      otp,
      expired: 0,
      requestDate: helper.createAttendanceTime()
    })

    return res.status(200).send({
      message: 'Request reset password berhasil.',
      otp,
      role: role
    })
  } catch (err) {
    logging.errorLogging('createPasswordReset', 'PasswordReset', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.verifyOtp = async (req, res) => {
  const { otp, role, password } = req.body

  try {
    const dbPasswordReset = await passwordReset.query().where({ otp })

    if (dbPasswordReset.length === 0) {
      return res.status(401).send({
        otp: false
      })
    }

    if (dbPasswordReset[0].expired === 1) {
      return res.status(409).send({
        otp: 'expired'
      })
    }

    if (role === 'panitia') {
      await panitia.query()
        .update({
          password: bcrypt.hashSync(password, 8)
        })
        .where({ nim: dbPasswordReset[0].nim })
    } else if (role === 'organizator') {
      await organizator.query()
        .update({
          password: bcrypt.hashSync(password, 8)
        })
        .where({ nim: dbPasswordReset[0].nim })
    } else {
      res.status(400).send({
        message: 'Akun tidak ditemukan atau belum terdaftar'
      })
    }

    await passwordReset.query().update({
      expired: 1
    }).where({ otp })

    return res.status(200).send({
      message: 'Password berhasil di update',
      otp: true
    })
  } catch (err) {
    logging.errorLogging('verifyOTP', 'PasswordReset', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}
