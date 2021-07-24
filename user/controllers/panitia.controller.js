/* eslint no-unused-vars: "off" */

const panitia = require('../models/panitia.model')
const divisi = require('../models/divisi.model')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.config')
const helper = require('../../helpers/helper')
const bcrypt = require('bcryptjs')
const logging = require('../../mongoose/controllers/logging.mongoose')
const address = require('address')
const toggleHelper = require('../../toggle/controllers/toggle.controller')
const toggle = require('../../toggle/models/toggle.model')

exports.getPanitia = async (req, res) => {
  const { param } = req.query

  const type = 'read/Panitia'

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
    const errorLogging = logging.errorLogging('getPanitia', 'Panitia', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.signUp = async (req, res) => {
  const id = 2

  const dbToggle = await toggle.query().where({ id })

  const status = toggleHelper.checkToggle(dbToggle[0].toggle)

  if (status === false) {
    return res.status(403).send({
      message: 'Closed'
    })
  }

  const {
    nim,
    name,
    email,
    password,
    divisiID
  } = req.body

  const verified = 0

  const type = 'signUp/Panitia'

  const fixName = helper.toTitleCase(name)

  try {
    const result = await panitia.query().where('nim', nim)

    if (result.length !== 0) { return res.status(409).send({ message: 'nim sudah terdaftar' }) }

    const checkDivisi = await divisi.query().where('divisiID', divisiID)

    if (checkDivisi.length === 0) { return res.status(404).send({ message: 'Divisi tidak tersedia' }) }

    const fixPassword = bcrypt.hashSync(password, 8)

    const insertResult = await panitia.query().insert({
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
    const errorLogging = logging.errorLogging('signUp', 'Panitia', err.message)
    res.status(500).send({ message: err.message })
  }
}

exports.signIn = async (req, res) => {
  const { nim, password } = req.body

  const ip = address.ip()

  const type = 'signIn/Panitia'

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

    const token = jwt.sign({ nim: dbPanitia[0].nim }, authConfig.jwt_key, {
      expiresIn: 21600
    })

    const loginLogging = logging.loginLogging(nim, ip)

    res.status(200).send({
      message: 'Berhasil Login',
      token: token
    })
  } catch (err) {
    const errorLogging = logging.errorLogging('signIn', 'Panitia', err.message)
    res.status(500).send({ message: err.message })
  }
}

exports.verifyNim = async (req, res) => {
  const nimPanitia = req.params.nim

  const nim = req.nim

  const acceptedDivision = 'D01'

  const type = 'verify/Panitia'

  let verified = 1

  try {
    const checkNim = await panitia.query().where({ nim })

    if (checkNim[0].divisiID !== acceptedDivision) {
      return res.status(403).send({
        message: 'Divisi anda tidak memiliki akses'
      })
    }

    const dbPanitia = await panitia.query().where('nim', nimPanitia)

    if (dbPanitia.length === 0) {
      return res.status(404).send({
        message: 'nim tidak terdaftar'
      })
    }

    if (dbPanitia[0].verified === 1) {
      verified = 0
    }

    const verifyPanitia = await panitia.query().where('nim', nimPanitia)
      .patch({
        verified
      })

    return res.status(200).send({
      message: 'data berhasil diupdate'
    })
  } catch (err) {
    const errorLogging = logging.errorLogging('verifyNim', 'Panitia', err.message)
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
    const updatePanitia = await panitia.query()
      .update({
        name,
        password: fixPassword
      })
      .where({ nim })

    return res.status(200).send({
      message: 'Update Profile Berhasil'
    })
  } catch (err) {
    const errorLogging = logging.errorLogging('update', 'Panitia', err.message)
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
