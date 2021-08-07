const panitia = require('../models/panitia.model')
const organizator = require('../models/organizator.model')
const logging = require('../../mongoose/controllers/logging.mongoose')
const bcrypt = require('bcryptjs')

exports.update = async (req, res) => {
  const nim = req.nim

  const role = req.role

  const {
    name,
    password,
    oldPassword
  } = req.body

  try {
    const dbPanitia = await panitia.query().where({ nim })
    const dbOrganizator = await organizator.query().where({ nim })

    let isOldPasswordValid

    switch (true) {
      case dbPanitia.length !== 0 :
        isOldPasswordValid = bcrypt.compareSync(oldPassword, dbPanitia[0].password)
        break
      case dbOrganizator.length !== 0 :
        isOldPasswordValid = bcrypt.compareSync(oldPassword, dbOrganizator[0].password)
        break
      default :
        return res.send({ message: 'nim tidak terdaftar' })
    }

    if (!isOldPasswordValid) {
      return res.status(403).send({ message: 'password invalid' })
    }

    const fixPassword = bcrypt.hashSync(password, 8)

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
