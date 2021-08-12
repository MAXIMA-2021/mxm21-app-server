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

    let isOldPasswordValid = true

    if (dbPanitia.length !== 0 && oldPassword) {
      isOldPasswordValid = bcrypt.compareSync(oldPassword, dbPanitia[0].password)
    } else if (dbOrganizator.length !== 0 && oldPassword) {
      isOldPasswordValid = bcrypt.compareSync(oldPassword, dbOrganizator[0].password)
    }

    if (isOldPasswordValid === false) {
      return res.status(403).send({ message: 'Password tidak sesuai dengan password lama, mohon melakukan pengecekan ulang dan mencoba lagi' })
    }

    switch (true) {
      case !password && role === 'panitia':
        await panitia.query()
          .update({
            name
          })
          .where({ nim })
        break
      case !password && role === 'organizator':
        console.log(2)
        await organizator.query()
          .update({
            name
          })
          .where({ nim })
        break
      case role === 'panitia':
        console.log(3)
        await panitia.query()
          .update({
            name,
            password: bcrypt.hashSync(password, 8)
          })
          .where({ nim })
        break
      case role === 'organizator':
        console.log(4)
        await organizator.query()
          .update({
            name,
            password: bcrypt.hashSync(password, 8)
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
