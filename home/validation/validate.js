/* eslint array-callback-return: "off" */

const { check, validationResult } = require('express-validator')

exports.insertHomeValidation = [
  check('name').notEmpty().withMessage('Nama tidak boleh kosong'),
  check('kategori').notEmpty().withMessage('Kategori tidak boleh kosong')
]

exports.insertLogoValidation = (req, res, next) => {
  const logoErrors = []
  const acceptedType = ['image/png', 'image/jpg', 'image/jpeg']

  if (!req.files || !req.files.linkLogo) {
    logoErrors.push({
      key: 'linkLogo',
      message: 'Gambar Logo tidak boleh kosong'
    })
  } else if (!acceptedType.includes(req.files.linkLogo.mimetype)) {
    logoErrors.push({
      key: 'linkLogo',
      message: 'Gambar Logo harap menggunakan file png, jpg, atau jpeg'
    })
  }

  req.logoErrors = logoErrors

  next()
}

exports.insertMediaValidation = async (req, res, next) => {
  const mediaErrors = []
  const acceptedType = ['image/png', 'image/jpg', 'image/jpeg']

  let linkMedia = []

  switch (true) {
    case !req.files :
      mediaErrors.push({
        key: 'linkMedia',
        message: 'Media Tidak Boleh Kosong'
      })
      break
    case req.files.linkMedia.length === undefined :
      linkMedia = [req.files.linkMedia]
      break
    case req.files.linkMedia.length !== undefined :
      linkMedia = req.files.linkMedia
      break
  }

  // if (!req.files) {
  //   mediaErrors.push({
  //     key: 'linkMedia',
  //     message: 'Media Tidak Boleh Kosong'
  //   })
  // } else if (req.files.linkMedia.length === undefined) {
  //   linkMedia = [req.files.linkMedia]
  // } else if (req.files.linkMedia.length !== undefined) {
  //   linkMedia = req.files.linkMedia
  // }

  for (let i = 0; i < linkMedia.length; i++) {
    if (!acceptedType.includes(linkMedia[i].mimetype)) {
      mediaErrors.push({
        key: `linkMedia-${i + 1}`,
        message: 'Gambar Media harap menggunakan file png, jpg, atau jpeg'
      })
    }
  }

  req.mediaErrors = mediaErrors

  next()
}

exports.updateLogoValidation = (req, res, next) => {
  const fileErrors = []
  const acceptedType = ['image/png', 'image/jpg', 'image/jpeg']

  let isAccepted = ''

  if (req.files) {
    isAccepted = acceptedType.includes(req.files.linkLogo.mimetype)
  }

  if (isAccepted === false) {
    fileErrors.push({
      key: 'linkLogo',
      message: 'Gambar Logo harap menggunakan file png, jpg, atau jpeg'
    })
  }

  req.logoErrors = fileErrors

  next()
}

exports.updateMediaValidation = (req, res, next) => {
  const fileErrors = []
  const acceptedType = ['image/png', 'image/jpg', 'image/jpeg']

  let isAccepted = ''

  if (req.files) {
    isAccepted = acceptedType.includes(req.files.linkMedia.mimetype)
  }

  if (isAccepted === false) {
    fileErrors.push({
      key: 'linkMedia',
      message: 'Gambar Media harap menggunakan file png, jpg, atau jpeg'
    })
  }

  req.mediaErrors = fileErrors

  next()
}

exports.runValidation = (req, res, next) => {
  const errors = validationResult(req).errors

  if (!req.logoErrors) {
    req.logoErrors = []
  }

  if (!req.mediaErrors) {
    req.mediaErrors = []
  }

  const fileErrors = req.logoErrors.concat(req.mediaErrors)

  let listErrors = []

  if (errors.length !== 0) {
    errors.map(error => {
      listErrors.push({
        key: error.param,
        message: error.msg
      })
    })
  }

  listErrors = listErrors.concat(fileErrors)

  if (listErrors.length !== 0) { return res.status(400).send(listErrors) }

  next()
}
