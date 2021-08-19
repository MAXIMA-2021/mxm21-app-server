/* eslint array-callback-return: "off" */

const { check, validationResult } = require('express-validator')

exports.mhsSignInGoogleValidation = [
  check('token').notEmpty().withMessage('Token tidak boleh kosong')
]

exports.mhsSignUpValidation = [
  check('nim').notEmpty().withMessage('Alô, Dreamers! NIM tidak boleh kosong, dicek lagi ya!'),
  check('name').notEmpty().withMessage('Alô, Dreamers! Nama tidak boleh kosong, dicek lagi ya!'),
  check('email').notEmpty().withMessage('Alô, Dreamers! Email tidak boleh kosong, dicek lagi ya!'),
  check('password').notEmpty().withMessage('Alô, Dreamers! Password tidak boleh kosong, dicek lagi ya!'),
  check('tempatLahir').notEmpty().withMessage('Alô, Dreamers! Tempat lahir tidak boleh kosong, dicek lagi ya!'),
  check('tanggalLahir').notEmpty().withMessage('Alô, Dreamers! Tanggal lahir tidak boleh kosong, dicek lagi ya!'),
  check('jenisKelamin').notEmpty().withMessage('Alô, Dreamers! Jenis kelamin tidak boleh kosong, dicek lagi ya!'),
  check('prodi').notEmpty().withMessage('Alô, Dreamers! Prodi tidak boleh kosong, dicek lagi ya!'),
  check('whatsapp').notEmpty().withMessage('Alô, Dreamers! Nomor Whatsapp tidak boleh kosong, dicek lagi ya!'),
  check('idLine').notEmpty().withMessage('Alô, Dreamers! ID Line tidak boleh kosong, dicek lagi ya!'),
  check('idInstagram').notEmpty().withMessage('Alô, Dreamers! Username Instagram tidak boleh kosong, dicek lagi ya!')
]

exports.mhsUpdatedValidation = [
  check('name').notEmpty().withMessage('Nama tidak boleh kosong'),
  check('tempatLahir').notEmpty().withMessage('Tempat Lahir tidak boleh kosong'),
  check('tanggalLahir').notEmpty().withMessage('Tanggal Lahir tidak boleh kosong'),
  check('jenisKelamin').notEmpty().withMessage('Jenis kelamin tidak boleh kosong'),
  check('prodi').notEmpty().withMessage('Prodi tidak boleh kosong'),
  check('whatsapp').notEmpty().withMessage('Nomor Whatsapp tidak boleh kosong'),
  check('idLine').notEmpty().withMessage('Id Line tidak boleh kosong'),
  check('idInstagram').notEmpty().withMessage('Id Instagram tidak boleh kosong')
]

exports.panitiaSignUpValidation = [
  check('nim').notEmpty().withMessage('Nim tidak boleh kosong'),
  check('name').notEmpty().withMessage('Nama tidak boleh kosong'),
  check('email').notEmpty().withMessage('Email tidak boleh kosong'),
  check('password').notEmpty().withMessage('password tidak boleh kosong'),
  check('divisiID').notEmpty().withMessage('ID divisi tidak boleh kosong')
]

exports.organizatorSignUpValidation = [
  check('nim').notEmpty().withMessage('Nim tidak boleh kosong'),
  check('name').notEmpty().withMessage('Nama tidak boleh kosong'),
  check('email').notEmpty().withMessage('Email tidak boleh kosong'),
  check('password').notEmpty().withMessage('password tidak boleh kosong'),
  check('stateID').notEmpty().withMessage('ID State tidak boleh kosong')
]

exports.notMhsUpdatedValidation = [
  check('name').notEmpty().withMessage('Nama tidak boleh kosong')
]

exports.signInValidation = [
  check('nim').notEmpty().withMessage('Nim tidak boleh kosong'),
  check('password').notEmpty().withMessage('Password tidak boleh kosong')
]

exports.mhsSignInValidation = [
  check('nim').notEmpty().withMessage('Alô, Dreamers! NIM tidak boleh kosong, dicek lagi ya!'),
  check('password').notEmpty().withMessage('Alô, Dreamers! Password tidak boleh kosong, dicek lagi ya!')
]

exports.passwordValidation = (req, res, next) => {
  const { password, oldPassword } = req.body
  const passwordErrors = []

  if (!oldPassword && password) {
    passwordErrors.push({
      key: 'oldPassword',
      message: 'Password yang lama harap diisi'
    })
  } else if (oldPassword && !password) {
    passwordErrors.push({
      key: 'password',
      message: 'Password yang baru harap diisi'
    })
  }

  req.passwordErrors = passwordErrors

  next()
}
exports.runValidation = (req, res, next) => {
  const errors = validationResult(req).errors
  const passwordErrors = req.passwordErrors
  const listErrors = []
  if (errors.length !== 0) {
    errors.map(error => {
      listErrors.push({
        key: error.param,
        message: error.msg
      })
    })
  }
  if (passwordErrors !== undefined && passwordErrors.length !== 0) {
    listErrors.push(passwordErrors[0])
  }

  if (listErrors.length !== 0) {
    return res.status(400).send(listErrors)
  }
  next()
}
