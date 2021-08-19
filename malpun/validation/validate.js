/* eslint array-callback-return: "off" */

const { check, validationResult } = require('express-validator')

exports.registerMalpun = [
  check('name').notEmpty().withMessage('Alô, Dreamers! Nama tidak boleh kosong, dicek lagi ya!'),
  check('email').notEmpty().withMessage('Alô, Dreamers! Email tidak boleh kosong, dicek lagi ya!')
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
