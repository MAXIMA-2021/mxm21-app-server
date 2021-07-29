const panitia = require('../models/panitia.model')
const organizator = require('../models/organizator.model')
const mahasiswa = require('../models/mahasiswa.model')
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

  const nim = req.nim

  let name

  if (division) {
    name = await panitia.query().where({ nim })
    return res.status(200).send({
      message: `${status}`,
      name: name[0].name,
      role: 'panitia',
      division: division
    })
  } else if (stateID) {
    name = await organizator.query().where({ nim })
    return res.status(200).send({
      message: `${status}`,
      name: name[0].name,
      role: 'organizator',
      stateID: stateID
    })
  } else {
    name = await mahasiswa.query().where({ nim })
    return res.status(200).send({
      message: `${status}`,
      name: name[0].name,
      role: 'mahasiswa'
    })
  }
}
