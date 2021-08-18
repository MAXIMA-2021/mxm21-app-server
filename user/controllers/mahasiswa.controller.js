const mahasiswa = require('../models/mahasiswa.model')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.config')
const helper = require('../../helpers/helper')
const logging = require('../../mongoose/controllers/logging.mongoose')
const address = require('address')
const bcrypt = require('bcryptjs')

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
    name,
    nim,
    password,
    whatsapp,
    email,
    idInstagram,
    idLine,
    tempatLahir,
    tanggalLahir,
    jenisKelamin,
    prodi
  } = req.body

  const fixName = helper.toTitleCase(name).trim()

  try {
    const result = await mahasiswa.query().where('nim', nim)

    if (result.length !== 0) return res.status(409).send({ message: `Alô, Dreamers! NIM kamu sudah terdaftar, silakan melakukan login ya!` })

    const fixPassword = bcrypt.hashSync(password, 8)

    await mahasiswa.query().insert({
      name: fixName,
      nim,
      password: fixPassword,
      whatsapp,
      email,
      idInstagram,
      idLine,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      prodi
    })

    const mailjet = require('node-mailjet').connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE)

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
                Email: `${email}`,
                Name: `${fixName}`
              }
            ],
            TemplateID: 3103958,
            TemplateLanguage: true,
            Subject: 'Pendaftaran Akun Berhasil',
            Variables: {
              name: `${fixName}`
            }
          }
        ]
      })

    return res.status(200).send({
      message: 'Akun kamu berhasil dibuat!'
    })
  } catch (err) {
    logging.errorLogging('signUp', 'Mahasiswa', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.signIn = async (req, res) => {
  const { nim, password } = req.body

  const ip = address.ip()

  try {
    const dbMahasiswa = await mahasiswa.query().where('nim', nim)

    if (dbMahasiswa.length === 0) {
      return res.status(401).send({ message: 'Alô, Dreamers! NIM atau password yang kamu masukkan masih kurang tepat, dicek lagi ya!' })
    }

    const checkPassword = bcrypt.compareSync(password, dbMahasiswa[0].password)

    if (!checkPassword) {
      return res.status(401).send({ message: 'Alô, Dreamers! NIM atau password yang kamu masukkan masih kurang tepat, dicek lagi ya!' })
    }

    const token = jwt.sign({ nim: dbMahasiswa[0].nim }, authConfig.jwt_key, {
      expiresIn: 21600
    })

    logging.loginLogging(nim, ip)

    return res.status(200).send({
      message: 'Kamu berhasil login!',
      token: token,
      nama: dbMahasiswa[0].name,
      role: 'mahasiswa'
    })
  } catch (err) {
    logging.errorLogging('signIn', 'Mahasiswa', err.message)
    return res.status(500).send({ message: err.message })
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

  const fixName = helper.toTitleCase(name).trim()

  try {
    const dbMahasiswa = await mahasiswa.query().where({ nim })

    if (dbMahasiswa.length === 0) {
      return res.status(400).send({
        message: 'Akun tidak ditemukan atau belum terdaftar'
      })
    }

    await mahasiswa.query()
      .update({
        name: fixName,
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
      name: fixName,
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
