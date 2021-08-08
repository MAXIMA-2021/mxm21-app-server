const toggle = require('../models/toggle.model')
const logging = require('../../mongoose/controllers/logging.mongoose')

exports.checkToggle = (status) => {
  let checkToggle = true

  if (status === 0) {
    checkToggle = false
  }

  return checkToggle
}

exports.getToggle = async (req, res) => {
  const divisiID = req.division

  const acceptedDivision = ['D01']

  if (!acceptedDivision.includes(divisiID)) {
    return res.status(403).send({
      message: 'Forbidden'
    })
  }

  try {
    const result = await toggle.query()

    return res.status(200).send(result)
  } catch (err) {
    logging.errorLogging('getToggle', 'Toggle', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.updateToggle = async (req, res) => {
  const { id } = req.params

  let status = 0

  const divisiID = req.division

  const acceptedDivision = ['D01']

  if (!acceptedDivision.includes(divisiID)) {
    return res.status(403).send({
      message: 'Forbidden'
    })
  }

  try {
    const dbToggle = await toggle.query().where({ id })

    if (dbToggle.length === 0) {
      return res.status(400).send({
        message: 'endpoint tidak ditemukan'
      })
    }

    if (dbToggle[0].toggle === 0) {
      status = 1
    }

    await toggle.query()
      .update({
        toggle: status
      })
      .where({ id })

    return res.status(200).send({
      status
    })
  } catch (err) {
    logging.errorLogging('updateToggle', 'Toggle', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}
