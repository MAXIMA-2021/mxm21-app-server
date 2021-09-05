/* eslint array-callback-return: "off" */

const { check, validationResult } = require('express-validator')

exports.registerMalpun = [
  check('nim').notEmpty().withMessage('Alô, Dreamers! NIM tidak boleh kosong, dicek lagi ya!'),
  check('nama').notEmpty().withMessage('Alô, Dreamers! Nama tidak boleh kosong, dicek lagi ya!'),
  check('noTelp').notEmpty().withMessage('Alô, Dreamers! Nomor Telepon tidak boleh kosong, dicek lagi ya!'),
  check('idLine').notEmpty().withMessage('Alô, Dreamers! ID Line tidak boleh kosong, dicek lagi ya!')
]

exports.runValidation = (req, res, next) => {
  const errors = validationResult(req).errors
  const listErrors = []
  if (errors.length !== 0) {
    errors.map(error => {
      listErrors.push({
        key: error.param,
        message: error.msg
      })
    })
    return res.status(400).send(listErrors)
  }
  next()
}
