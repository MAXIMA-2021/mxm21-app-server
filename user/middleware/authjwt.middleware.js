const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.config')
const mahasiswa = require('../models/mahasiswa.model')
const panitia = require('../models/panitia.model')
const organizator = require('../models/organizator.model')
const logging = require('../../mongoose/controllers/logging.mongoose')

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token']

    if (!token) return res.status(401).send({ message: 'Belum Login' })

    jwt.verify(token, authConfig.jwt_key, (err, decoded) => {
      if (err) return res.status(403).send({ message: 'Token Invalid' })

      if (decoded.stateID) {
        req.query.param = decoded.stateID
      }

      req.nim = decoded.nim
      next()
    })
  } catch (err) {
    logging.errorLogging('verifyToken', 'JWT', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.isMahasiswa = async (req, res, next) => {
  const nim = req.nim

  req.query.nim = nim
  req.roleID = 1

  try {
    const result = await mahasiswa.query().where('nim', nim)

    if (result.length === 0) return res.status(403).send({ message: 'Forbidden' })

    req.status = true
    next()
  } catch (err) {
    logging.errorLogging('isMahasiswa', 'JWT', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.isPanitia = async (req, res, next) => {
  const nim = req.nim

  req.roleID = 2

  try {
    const result = await panitia.query().where('nim', nim)

    if (result.length === 0) return res.status(403).send({ message: 'Forbidden' })

    req.status = true

    req.division = result[0].divisiID

    next()
  } catch (err) {
    logging.errorLogging('isPanitia', 'JWT', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.isOrganizator = async (req, res, next) => {
  const nim = req.nim

  req.roleID = 3

  try {
    const result = await organizator.query().where('nim', nim)

    if (result.length === 0) return res.status(403).send({ message: 'Forbidden' })

    req.status = true
    next()
  } catch (err) {
    logging.errorLogging('isOrganizator', 'JWT', err.message)
    return res.status(500).send({ message: err.message })
  }
}
