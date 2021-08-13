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

exports.linkValidation = async (req, res, next) => {
  const linkErrors = []
  const linkYoutube = req.body.linkYoutube
  const match = linkYoutube.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)

  if (match === null) {
    linkErrors.push({
      key: 'link',
      message: 'Link video youtube tidak valid'
    })
  }

  req.linkErrors = linkErrors

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
    case req.files.linkMedia.length !== req.body.photoID.length :
      mediaErrors.push({
        key: 'linkMedia',
        message: 'Terdapat salah satu form Media yang kosong'
      })
      break
    case req.files.linkMedia.length === undefined :
      linkMedia = [req.files.linkMedia]
      break
    case req.files.linkMedia.length !== undefined :
      linkMedia = req.files.linkMedia
      break
  }

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

exports.runValidation = (req, res, next) => {
  const errors = validationResult(req).errors

  if (!req.logoErrors) {
    req.logoErrors = []
  }

  if (!req.mediaErrors) {
    req.mediaErrors = []
  }

  if (!req.linkErrors) {
    req.linkErrors = []
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

  listErrors = listErrors.concat(req.linkErrors)

  listErrors = listErrors.concat(fileErrors)

  if (listErrors.length !== 0) { return res.status(400).send(listErrors) }

  next()
}
