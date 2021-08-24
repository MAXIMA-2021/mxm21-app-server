const passwordReset = require('../models/passwordReset.model')
const logging = require('../../mongoose/controllers/logging.mongoose')
const helper = require('../../helpers/helper')
const panitia = require('../../user/models/panitia.model')
const organizator = require('../../user/models/organizator.model')
const mahasiswa = require('../../user/models/mahasiswa.model')
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

    const dbMahasiswa = await mahasiswa.query().where({ nim })

    switch (true) {
      case dbPanitia.length !== 0 :
        role = 'panitia'
        break
      case dbOrganizator.length !== 0 :
        role = 'organizator'
        break
      case dbMahasiswa.length !== 0 :
        role = 'mahasiswa'
        break
      case dbPanitia.length === 0 && dbOrganizator.length === 0 && dbMahasiswa.length !== 0 :
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

    let dbPasswordReset

    switch (role) {
      case 'panitia' :
        dbPasswordReset = await panitia.query().where({ nim })
        break
      case 'organizator' :
        dbPasswordReset = await organizator.query().where({ nim })
        break
      case 'mahasiswa' :
        dbPasswordReset = await mahasiswa.query().where({ nim })
    }

    const mailjet = require('node-mailjet')
      .connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE)
    await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: 'web@mxm.one',
              Name: 'MAXIMA UMN 2021'
            },
            To: [
              {
                Email: `${dbPasswordReset[0].email}`,
                Name: `${dbPasswordReset[0].name}`
              }
            ],
            TemplateID: 3112779,
            TemplateLanguage: true,
            Subject: 'Permohonan Penggantian Kata Sandi',
            Variables: {
              name: `${dbPasswordReset[0].name}`,
              otp_code: `${otp}`
            }
          }
        ]
      })

    return res.status(200).send({
      message: 'Request reset password berhasil.',
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
    } else if (role === 'mahasiswa') {
      await mahasiswa.query()
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
