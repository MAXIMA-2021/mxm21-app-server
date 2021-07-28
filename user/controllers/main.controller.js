const panitia = require('../models/panitia.model')
const organizator = require('../models/organizator.model')
const logging = require('../../mongoose/controllers/logging.mongoose')
const bcrypt = require('bcryptjs')

exports.update = async (req, res) => {
  const nim = req.nim

  const role = req.role

  const {
    name,
    password
  } = req.body

  const fixPassword = bcrypt.hashSync(password, 8)

  try {
    if (!password && role === 'panitia') {
      await panitia.query()
        .update({
          name
        })
        .where({ nim })
    } else if (!password && role === 'organizator') {
      await organizator.query()
        .update({
          name
        })
        .where({ nim })
    } else if (role === 'panitia') {
      await panitia.query()
        .update({
          name,
          password: fixPassword
        })
        .where({ nim })
    } else if (role === 'organizator') {
      await organizator.query()
        .update({
          name,
          password: fixPassword
        })
        .where({ nim })
    }

    return res.status(200).send({
      message: 'Update Profile Berhasil'
    })
  } catch (err) {
    logging.errorLogging('update', 'Panitia', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.checkToken = async (req, res) => {
  const stateID = req.stateID

  const division = req.divisiID

  const status = req.status

  if (division) {
    return res.status(200).send({
      message: `${status}`,
      role: 'panitia',
      division: division
    })
  } else if (stateID) {
    return res.status(200).send({
      message: `${status}`,
      role: 'organizator',
      stateID: stateID
    })
  } else {
    return res.status(200).send({
      message: `${status}`,
      role: 'mahasiswa'
    })
  }
}
