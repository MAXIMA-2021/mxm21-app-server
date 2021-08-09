/* eslint array-callback-return: "off" */

const { check, validationResult } = require('express-validator')

exports.chapterUpdateValidation = [
  check('title').notEmpty().withMessage('Judul tidak boleh kosong'),
  check('message').notEmpty().withMessage('Isi chapter tidak boleh kosong')
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
