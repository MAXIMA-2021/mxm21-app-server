const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.CLIENT_ID)
const mahasiswa = require('../models/mahasiswa.model')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.config')
const helper = require('../../helpers/helper')
const logging = require('../../mongoose/controllers/logging.mongoose')
const address = require('address')

exports.getMahasiswa = async (req, res) => {
  const { param } = req.query

  let result

  try {
    if (param === undefined) {
      result = await mahasiswa.query()
    } else {
      result = await mahasiswa.query().where({ nim: param })
    }
    return res.status(200).send(result)
  } catch (err) {
    logging.errorLogging('getMahasiswa', 'Mahasiswa', err.message)
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
    tempatLahir,
    tanggalLahir,
    jenisKelamin,
    prodi,
    whatsapp,
    idLine,
    idInstagram,
    GoogleID
  } = req.body

  const fixName = helper.toTitleCase(name)

  try {
    const result = await mahasiswa.query().where('nim', nim)

    if (result.length !== 0) return res.status(409).send({ message: `Akun dengan nim ${nim} sudah terdaftar` })

    await mahasiswa.query().insert({
      nim,
      GoogleID,
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

    if (GoogleID) {
      const dbMahasiswa = await mahasiswa.query().where('nim', nim)
      const token = jwt.sign({ nim: dbMahasiswa[0].nim }, authConfig.jwt_key, {
        expiresIn: 21600
      })
      return res.status(200).send({
        message: 'Berhasil Login',
        token: token,
        name: dbMahasiswa[0].name,
        role: 'mahasiswa'
      })
    }

    return res.status(200).send({
      message: 'Akun berhasil dibuat!'
    })
  } catch (err) {
    logging.errorLogging('signUp', 'Mahasiswa', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.getGoogleToken = async (req, res) => {
  const { token } = req.body

  try {
    const profile = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID
    })
    const payload = profile.getPayload()
    const userid = payload.sub

    const dbMahasiswa = await mahasiswa.query()
      .where({
        GoogleID: userid
      })

    if (dbMahasiswa.length === 0) {
      return res.status(200).send({
        message: 'no GoogleID'
      })
    } else {
      const token = jwt.sign({ nim: dbMahasiswa[0].nim }, authConfig.jwt_key, {
        expiresIn: 21600
      })
      return res.status(200).send({
        message: 'Berhasil Login',
        token: token,
        name: dbMahasiswa[0].name,
        role: 'mahasiswa'
      })
    }
  } catch (err) {
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.signIn = async (req, res) => {
  const { nim, password } = req.body

  const ip = address.ip()

  try {
    const dbMahasiswa = await mahasiswa.query().where('nim', nim)

    if (dbMahasiswa.length === 0) { return res.status(400).send({ message: 'Akun tidak ditemukan atau belum terdaftar' }) }

    const password2 = helper.createPassword(dbMahasiswa)

    if (password !== password2) {
      return res.status(401).send({ message: 'Nim atau password salah, mohon melakukan pengecekan ulang dan mencoba lagi' })
    }

    const token = jwt.sign({ nim: dbMahasiswa[0].nim }, authConfig.jwt_key, {
      expiresIn: 21600
    })

    logging.loginLogging(nim, ip)

    return res.status(200).send({
      message: 'Berhasil Login',
      token: token,
      nama: dbMahasiswa[0].name,
      role: 'mahasiswa'
    })
  } catch (err) {
    logging.errorLogging('signIn', 'Mahasiswa', err.message)
    return res.status(500).send({ message: err.message })
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
    await mahasiswa.query()
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
    logging.errorLogging('update', 'Mahasiswa', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.advanceUpdate = async (req, res) => {
  const { nim } = req.params

  const acceptedDivision = ['D01', 'D02', 'D03', 'D12']

  const division = req.division

  if (!acceptedDivision.includes(division)) {
    return res.status(403).send({
      message: 'Divisi anda tidak memiliki otoritas yang cukup'
    })
  }

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
    const dbMahasiswa = await mahasiswa.query().where({ nim })

    if (dbMahasiswa.length === 0) {
      return res.status(400).send({
        message: 'Akun tidak ditemukan atau belum terdaftar'
      })
    }

    await mahasiswa.query()
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

    const object1 = {
      name: dbMahasiswa[0].name,
      tempatLahir: dbMahasiswa[0].tempatLahir,
      tanggalLahir: helper.createDateNumber(dbMahasiswa[0].tanggalLahir),
      jenisKelamin: dbMahasiswa[0].jenisKelamin,
      prodi: dbMahasiswa[0].prodi,
      whatsapp: dbMahasiswa[0].whatsapp,
      idLine: dbMahasiswa[0].idLine,
      idInstagram: dbMahasiswa[0].idInstagram
    }

    const object2 = {
      name,
      tempatLahir,
      tanggalLahir: helper.createDateNumber(new Date(tanggalLahir)),
      jenisKelamin,
      prodi,
      whatsapp,
      idLine,
      idInstagram
    }

    const fixObject = helper.createUpdatedObject(object1, object2)

    logging.studentEditLogging('Edit/Mahasiswa', req.nim, nim, fixObject)

    return res.status(200).send({
      message: 'Update Data Mahasiswa Berhasil!'
    })
  } catch (err) {
    logging.errorLogging('advanceUpdate', 'Mahasiswa', err.message)
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
