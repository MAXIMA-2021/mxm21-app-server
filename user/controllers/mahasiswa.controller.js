/* eslint no-unused-vars: "off" */

const mahasiswa = require('../models/mahasiswa.model')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.config')
const helper = require('../../helpers/helper')
const logging = require('../../mongoose/controllers/logging.mongoose')
const address = require('address')
const toggleHelper = require('../../toggle/controllers/toggle.controller')
const toggle = require('../../toggle/models/toggle.model')

exports.getMahasiswa = async (req, res) => {
  try {
    const result = await mahasiswa.query()

    return res.status(200).send(result)
  } catch (err) {
    const errorLogging = logging.errorLogging('getMahasiswa', 'Mahasiswa', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.signUp = async (req, res) => {
  const id = 1

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
    tempatLahir,
    tanggalLahir,
    jenisKelamin,
    prodi,
    whatsapp,
    idLine,
    idInstagram
  } = req.body

  const fixName = helper.toTitleCase(name)

  try {
    const result = await mahasiswa.query().where('nim', nim)

    if (result.length !== 0) return res.status(409).send({ message: 'nim sudah terdaftar' })

    const insertResult = await mahasiswa.query().insert({
      nim,
      GoogleID: '',
      name: fixName,
      email,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      prodi,
      whatsapp,
      idLine,
      idInstagram
    })

    res.status(200).send({
      message: 'Data berhasil ditambahkan'
    })
  } catch (err) {
    const errorLogging = logging.errorLogging('signUp', 'Mahasiswa', err.message)
    res.status(500).send({ message: err.message })
  }
}

exports.signIn = async (req, res) => {
  const { nim, password } = req.body

  const ip = address.ip()

  try {
    const dbMahasiswa = await mahasiswa.query().select('nim', 'tanggalLahir').where('nim', nim)

    if (dbMahasiswa.length === 0) { return res.status(404).send({ message: 'nim tidak terdaftar' }) }

    const password2 = helper.createPassword(dbMahasiswa)

    if (password !== password2) {
      return res.status(401).send({ message: 'Password is invalid' })
    }

    const token = jwt.sign({ nim: dbMahasiswa[0].nim }, authConfig.jwt_key, {
      expiresIn: 21600
    })

    const loginLogging = logging.loginLogging(nim, ip)

    res.status(200).send({
      message: 'Berhasil Login',
      token: token
    })
  } catch (err) {
    const errorLogging = logging.errorLogging('signIn', 'Mahasiswa', err.message)
    res.status(500).send({ message: err.message })
  }
}

exports.update = async (req, res) => {
  const nim = req.nim

  const {
    name,
    tempatLahir,
    tanggalLahir,
    jenisKelamin,
    prodi,
    whatsapp,
    idLine,
    idInstagram
  } = req.body

  try {
    const updateMahasiswa = await mahasiswa.query()
      .update({
        name,
        tempatLahir,
        tanggalLahir,
        jenisKelamin,
        prodi,
        whatsapp,
        idLine,
        idInstagram
      })
      .where({ nim })

    return res.status(200).send({
      message: 'Update Profile Berhasil'
    })
  } catch (err) {
    const errorLogging = logging.errorLogging('update', 'Mahasiswa', err.message)
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
