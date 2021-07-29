const malpun = require('../models/malpun.model')
const helper = require('../../helpers/helper')
const logging = require('../../mongoose/controllers/logging.mongoose')

exports.getMalpunData = async (req, res) => {
  const acceptedDivision = ['D01', 'D02', 'D03', 'D04']

  const division = req.division

  if (!acceptedDivision.includes(division)) {
    return res.status(403).send({
      message: 'Forbidden'
    })
  }

  try {
    const result = await malpun.query()

    return res.status(200).send(result)
  } catch (err) {
    logging.errorLogging('getMalpunData', 'Malpun', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.registerMalpun = async (req, res) => {
  const {
    name,
    email,
    phoneNumber
  } = req.body

  helper.toTitleCase(name)

  try {
    await malpun.query().insert({
      email,
      name,
      phoneNumber
    })

    return res.status(200).send({
      message: 'Anda berhasil mendaftar'
    })
  } catch (err) {
    logging.errorLogging('getMalpunData', 'Malpun', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}
