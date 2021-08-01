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
    switch (true) {
      case !password && role === 'panitia':
        await panitia.query()
          .update({
            name
          })
          .where({ nim })
        break
      case !password && role === 'organizator':
        await organizator.query()
          .update({
            name
          })
          .where({ nim })
        break
      case role === 'panitia':
        await panitia.query()
          .update({
            name,
            password: fixPassword
          })
          .where({ nim })
        break
      case role === 'organizator':
        await organizator.query()
          .update({
            name,
            password: fixPassword
          })
          .where({ nim })
        break
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
