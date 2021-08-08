/* eslint array-callback-return: "off" */

const { check, validationResult } = require('express-validator')

exports.forgetPassword = [
  check('nim').notEmpty().withMessage('Nim tidak boleh kosong')
]

exports.verifyOTP = [
  check('otp').notEmpty().withMessage('OTP tidak boleh kosong'),
  check('role').notEmpty().withMessage('Role tidak boleh kosong'),
  check('password').notEmpty().withMessage('Password tidak boleh kosong')
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
