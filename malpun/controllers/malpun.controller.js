const malpun = require('../models/malpun.model')
const mahasiswa = require('../../user/models/mahasiswa.model')
const panitia = require('../../user/models/panitia.model')
const helper = require('../../helpers/helper')
const logging = require('../../mongoose/controllers/logging.mongoose')

exports.getMalpunData = async (req, res) => {
  const nim = req.nim

  const acceptedDivision = ['D01', 'D02', 'D03', 'D04']

  try {
    const checkNim = await panitia.query().where({ nim })

    if (!acceptedDivision.includes(checkNim[0].divisiID)) {
      return res.status(403).send({
        message: 'Maaf divisi anda tidak diizinkan unuk mengaksesnya'
      })
    }

    const result = await malpun.query()

    return res.status(200).send(result)
  } catch (err) {
    const errorLogging = logging.errorLogging('getMalpunData', 'Malpun', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.registerMalpun = async (req, res) => {
  const {
    name,
    email,
    phoneNumber
  } = req.body

  const fixName = helper.toTitleCase(name)

  try {
    const insertMalpun = await malpun.query().insert({
      email,
      name,
      phoneNumber
    })

    return res.status(200).send({
      message: 'Anda berhasil mendaftar'
    })
  } catch (err) {
    const errorLogging = logging.errorLogging('getMalpunData', 'Malpun', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}
