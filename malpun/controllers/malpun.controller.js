/* eslint array-callback-return: "off" */

const malpun = require('../models/malpun.model')
const helper = require('../../helpers/helper')
const logging = require('../../mongoose/controllers/logging.mongoose')

exports.getMalpunData = async (req, res) => {
  const acceptedDivision = ['D01', 'D02', 'D03', 'D04']

  const division = req.division

  if (!acceptedDivision.includes(division)) {
    return res.status(403).send({
      message: 'Divisi anda tidak memiliki otoritas yang cukup'
    })
  }

  try {
    const result = await malpun.query()

    result.map(r => {
      r.lucky_number = r.malpunID
    })

    console.log(result)

    return res.status(200).send(result)
  } catch (err) {
    logging.errorLogging('getMalpunData', 'Malpun', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.getMalpunDataByNim = async (req, res) => {
  const { nim } = req.params

  try {
    const result = await malpun.query().where({ nim })

    if (result.length === 0) return res.status(400).send({ message: 'NIM tidak ditemukan atau belum terdaftar' })

    result[0].lucky_number = result[0].malpunID

    return res.status(200).send(result)
  } catch (err) {
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.registerMalpun = async (req, res) => {
  const {
    nim,
    nama,
    noTelp,
    idLine
  } = req.body

  helper.toTitleCase(nama)

  const createdAt = helper.createAttendanceTime()

  const checkNim = await malpun.query().where({ nim })

  if (checkNim.length !== 0) { return res.status(409).send({ message: 'Alô, Dreamers! NIM kamu sudah terdaftar' }) }

  try {
    const malpunDB = await malpun.query().insert({
      nim,
      nama,
      noTelp,
      idLine,
      createdAt
    })

    return res.status(200).send({
      message: 'Alô, Dreamers!, Kamu berhasil mendaftar malam puncak',
      lucky_number: malpunDB.id
    })
  } catch (err) {
    logging.errorLogging('getMalpunData', 'Malpun', err.message)
    return res.status(500).send({
      message: 'Alô, Dreamers! Maaf, terjadi kesalahan pada server'
    })
  }
}
