const mahasiswa = require('../models/mahasiswa.model')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.config')
const helper = require('../../helpers/helper')

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
    res.status(500).send({ message: err.message })
  }
}

exports.signIn = async (req, res) => {
  const { nim, password } = req.body

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

    res.status(200).send({
      message: 'Berhasil Login',
      token: token
    })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}
