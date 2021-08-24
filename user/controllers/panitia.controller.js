const panitia = require('../models/panitia.model')
const divisi = require('../models/divisi.model')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.config')
const helper = require('../../helpers/helper')
const bcrypt = require('bcryptjs')
const logging = require('../../mongoose/controllers/logging.mongoose')
const address = require('address')

exports.getPanitia = async (req, res) => {
  const { param } = req.query

  try {
    if (param === undefined) {
      const dbPanitia = await panitia.query()
        .join('divisi', 'divisi.divisiID', 'panitia.divisiID')
        .select(
          'panitia.name',
          'panitia.nim',
          'divisi.name as divisi',
          'panitia.verified'
        )

      return res.status(200).send(dbPanitia)
    }

    const dbPanitia = await panitia.query()
      .join('divisi', 'divisi.divisiID', 'panitia.divisiID')
      .select(
        'panitia.name',
        'panitia.nim',
        'divisi.name as divisi',
        'panitia.verified'
      )
      .where('divisi.name', param)
      .orWhere('panitia.name', param)
      .orWhere('panitia.nim', param)

    return res.status(200).send(dbPanitia)
  } catch (err) {
    logging.errorLogging('getPanitia', 'Panitia', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.signUp = async (req, res) => {
  const {
    nim,
    name,
    email,
    password,
    divisiID
  } = req.body

  if (divisiID === 'D01') return res.status(401).send({ message: 'Anda tidak dapat mendaftar pada divisi tersebut' })

  const verified = 0

  const fixName = helper.toTitleCase(name).trim()

  try {
    const result = await panitia.query().where('nim', nim)

    if (result.length !== 0) { return res.status(409).send({ message: 'nim sudah terdaftar sebelumnya' }) }

    const checkDivisi = await divisi.query().where('divisiID', divisiID)

    if (checkDivisi.length === 0) { return res.status(400).send({ message: 'Divisi tidak tersedia' }) }

    const fixPassword = await bcrypt.hash(password, 8)

    await panitia.query().insert({
      nim,
      name: fixName,
      email,
      password: fixPassword,
      divisiID,
      verified
    })

    return res.status(200).send({
      message: 'Akun berhasil dibuat'
    })
  } catch (err) {
    logging.errorLogging('signUp', 'Panitia', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.signIn = async (req, res) => {
  const { nim, password } = req.body

  const ip = address.ip()

  try {
    const dbPanitia = await panitia.query().where('nim', nim)

    if (dbPanitia.length === 0) { return res.status(400).send({ message: 'nim atau password tidak sesuai, mohon melakukan pengecekan ulang dan mencoba kembali' }) }

    if (dbPanitia[0].verified !== 1) {
      return res.status(401).send({
        message: 'Maaf akun anda belum diverifikasi oleh pihak pusat'
      })
    }

    const isPasswordValid = await bcrypt.compare(password, dbPanitia[0].password)

    if (!isPasswordValid) { return res.status(401).send({ message: 'Nim atau password tidak sesuai, mohon melakukan pengecekan ulang dan mencoba kembali' }) }

    const token = jwt.sign({ nim: dbPanitia[0].nim, division: dbPanitia[0].divisiID }, authConfig.jwt_key, {
      expiresIn: 21600
    })

    logging.loginLogging(nim, ip)

    return res.status(200).send({
      message: 'Berhasil Login',
      token: token,
      nama: dbPanitia[0].name,
      role: 'panitia',
      divisiID: dbPanitia[0].divisiID
    })
  } catch (err) {
    logging.errorLogging('signIn', 'Panitia', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.verifyNim = async (req, res) => {
  const nimPanitia = req.params.nim

  const acceptedDivision = ['D01', 'D02']

  const division = req.division

  if (!acceptedDivision.includes(division)) {
    return res.status(403).send({
      message: 'Divisi anda tidak memiliki otoritas yang cukup'
    })
  }

  let verified = 1
  let checkVerify = true

  try {
    const dbPanitia = await panitia.query().where('nim', nimPanitia)

    if (dbPanitia.length === 0) {
      return res.status(400).send({
        message: 'Akun tidak ditemukan atau belum terdaftar'
      })
    }

    if (dbPanitia[0].verified === 1) {
      verified = 0
      checkVerify = false
    }

    await panitia.query().where('nim', nimPanitia)
      .patch({
        verified
      })

    if (checkVerify) {
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
                  Email: `${dbPanitia[0].email}`,
                  Name: `${dbPanitia[0].name}`
                }
              ],
              TemplateID: 3112959,
              TemplateLanguage: true,
              Subject: 'Pendaftaran Akun Panitia / Organisator Berhasil',
              Variables: {
                name: `${dbPanitia[0].name}`,
                jenis_akun: 'Panitia'
              }
            }
          ]
        })
    }

    logging.verificationAccount('Panitia/Verify', req.nim, nimPanitia, verified)

    return res.status(200).send({
      verify: verified
    })
  } catch (err) {
    logging.errorLogging('verifyNim', 'Panitia', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}
