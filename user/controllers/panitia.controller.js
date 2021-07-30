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

    if (dbPanitia.length === 0) {
      return res.status(404).send({
        message: 'Akun Tidak Ditemukan'
      })
    }

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

  const verified = 0

  const fixName = helper.toTitleCase(name)

  try {
    const result = await panitia.query().where('nim', nim)

    if (result.length !== 0) { return res.status(409).send({ message: 'nim sudah terdaftar' }) }

    const checkDivisi = await divisi.query().where('divisiID', divisiID)

    if (checkDivisi.length === 0) { return res.status(404).send({ message: 'Divisi tidak tersedia' }) }

    const fixPassword = bcrypt.hashSync(password, 8)

    await panitia.query().insert({
      nim,
      name: fixName,
      email,
      password: fixPassword,
      divisiID,
      verified
    })

    res.status(200).send({
      message: 'Data berhasil ditambahkan'
    })
  } catch (err) {
    logging.errorLogging('signUp', 'Panitia', err.message)
    res.status(500).send({ message: err.message })
  }
}

exports.signIn = async (req, res) => {
  const { nim, password } = req.body

  const ip = address.ip()

  try {
    const dbPanitia = await panitia.query().where('nim', nim)

    if (dbPanitia.length === 0) { return res.status(404).send({ message: 'nim tidak terdaftar' }) }

    if (dbPanitia[0].verified !== 1) {
      return res.status(401).send({
        message: 'Maaf akun anda belum diverifikasi oleh pihak pusat'
      })
    }

    const isPasswordValid = bcrypt.compareSync(password, dbPanitia[0].password)

    if (!isPasswordValid) { return res.status(401).send({ message: 'Password Invalid' }) }

    const token = jwt.sign({ nim: dbPanitia[0].nim, division: dbPanitia[0].divisiID }, authConfig.jwt_key, {
      expiresIn: 21600
    })

    logging.loginLogging(nim, ip)

    res.status(200).send({
      message: 'Berhasil Login',
      token: token
    })
  } catch (err) {
    logging.errorLogging('signIn', 'Panitia', err.message)
    res.status(500).send({ message: err.message })
  }
}

exports.verifyNim = async (req, res) => {
  const nimPanitia = req.params.nim

  const acceptedDivision = ['D01']

  const division = req.division

  if (!acceptedDivision.includes(division)) {
    return res.status(403).send({
      message: 'Forbidden'
    })
  }

  let verified = 1

  try {
    const dbPanitia = await panitia.query().where('nim', nimPanitia)

    if (dbPanitia.length === 0) {
      return res.status(404).send({
        message: 'nim tidak terdaftar'
      })
    }

    if (dbPanitia[0].verified === 1) {
      verified = 0
    }

    await panitia.query().where('nim', nimPanitia)
      .patch({
        verified
      })

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

exports.update = async (req, res) => {
  const nim = req.nim

  const {
    name,
    password
  } = req.body

  const fixPassword = bcrypt.hashSync(password, 8)

  try {
    await panitia.query()
      .update({
        name,
        password: fixPassword
      })
      .where({ nim })

    return res.status(200).send({
      message: 'Update Profile Berhasil'
    })
  } catch (err) {
    logging.errorLogging('update', 'Panitia', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.checkToken = async (req, res) => {
  const status = req.status

  return res.status(200).send({
    message: `${status}`
  })
}
