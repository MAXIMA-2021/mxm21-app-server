const panitia = require('../models/panitia.model')
const divisi = require('../models/divisi.model')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.config')
const helper = require('../../helpers/helper')
const bcrypt = require('bcryptjs')

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
    res.status(500).send({ message: err.message })
  }
}

exports.signIn = async (req, res) => {
  const { nim, password } = req.body

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

    res.status(200).send({
      message: 'Berhasil Login',
      token: token
    })
  } catch (err) {
    res.status(500).send({ message: err.message })
  }
}
