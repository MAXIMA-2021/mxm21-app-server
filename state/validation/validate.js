/* eslint array-callback-return: "off" */

const { check, validationResult } = require('express-validator')

exports.createActivitiesValidation = [
  check('name').notEmpty().withMessage('Nama tidak boleh kosong'),
  check('zoomLink').notEmpty().withMessage('Link zoom tidak boleh kosong'),
  check('day').notEmpty().withMessage('Day tidak boleh kosong'),
  check('quota').notEmpty().withMessage('Jumlah quota tidak boleh kosong'),
  check('category').notEmpty().withMessage('Kategori tidak boleh kosong')
]

exports.logoValidation = (req, res, next) => {
  const logoErrors = []
  const acceptedType = ['image/png', 'image/jpg', 'image/jpeg']

  switch (true) {
    case !req.files :
      logoErrors.push({
        key: 'stateLogo',
        message: 'Gambar Logo tidak boleh kosong'
      })
      break
    case !req.files.stateLogo :
      logoErrors.push({
        key: 'stateLogo',
        message: 'Gambar Logo tidak boleh kosong'
      })
      break
    case (!acceptedType.includes(req.files.stateLogo.mimetype)) :
      logoErrors.push({
        key: 'stateLogo',
        message: 'Harap menggunakan tipe file png, jpg, atau jpeg'
      })
      break
  }

  // if (!req.files) {
  //   logoErrors.push({
  //     key: 'stateLogo',
  //     message: 'Gambar Logo tidak boleh kosong'
  //   })
  // } else if (!req.files.stateLogo) {
  //   logoErrors.push({
  //     key: 'stateLogo',
  //     message: 'Gambar Logo tidak boleh kosong'
  //   })
  // } else {
  //   if (!acceptedType.includes(req.files.stateLogo.mimetype)) {
  //     logoErrors.push({
  //       key: 'stateLogo',
  //       message: 'Harap menggunakan tipe file png, jpg, atau jpeg'
  //     })
  //   }
  // }

  req.logoErrors = logoErrors

  next()
}

exports.coverValidation = (req, res, next) => {
  const coverErrors = []
  const acceptedType = ['image/png', 'image/jpg', 'image/jpeg']

  switch (true) {
    case !req.files :
      coverErrors.push({
        key: 'coverPhoto',
        message: 'Foto Cover tidak boleh kosong'
      })
      break
    case !req.files.coverPhoto :
      coverErrors.push({
        key: 'coverPhoto',
        message: 'Gambar Logo tidak boleh kosong'
      })
      break
    case !acceptedType.includes(req.files.coverPhoto.mimetype) :
      coverErrors.push({
        key: 'coverPhoto',
        message: 'Harap menggunakan tipe file png, jpg, atau jpeg'
      })
      break
  }

  // if (!req.files) {
  //   coverErrors.push({
  //     key: 'coverPhoto',
  //     message: 'Foto Cover tidak boleh kosong'
  //   })
  // } else if (!req.files.coverPhoto) {
  //   coverErrors.push({
  //     key: 'coverPhoto',
  //     message: 'Gambar Logo tidak boleh kosong'
  //   })
  // } else {
  //   if (!acceptedType.includes(req.files.coverPhoto.mimetype)) {
  //     coverErrors.push({
  //       key: 'coverPhoto',
  //       message: 'Harap menggunakan tipe file png, jpg, atau jpeg'
  //     })
  //   }
  // }

  req.coverErrors = coverErrors

  next()
}

exports.updateActivitiesValidation = [
  check('name').notEmpty().withMessage('Nama tidak boleh kosong'),
  check('zoomLink').notEmpty().withMessage('Link zoom tidak boleh kosong'),
  check('day').notEmpty().withMessage('Day tidak boleh kosong'),
  check('quota').notEmpty().withMessage('Jumlah quota tidak boleh kosong'),
  check('category').notEmpty().withMessage('Kategori tidak boleh kosong')
]

exports.queryUpdateValidation = async (req, res, next) => {
  const stateActivities = require('../models/stateActivities.model')

  const { stateID } = req.params

  const { quota } = req.body

  const isProvide = await stateActivities.query().where('stateID', stateID)

  if (isProvide.length === 0) {
    return res.status(400).send({
      message: 'State tidak ditemukan atau belum terdaftar'
    })
  }

  if (parseInt(quota) < isProvide[0].registered) {
    return res.status(409).send({
      message: 'Jumlah Quota state lebih sedikit daripada jumlah yang telah mendaftar'
    })
  }

  next()
}

exports.logoUpdateValidation = (req, res, next) => {
  const logoErrors = []
  const acceptedType = ['image/png', 'image/jpg', 'image/jpeg']
  if (req.files && req.files.stateLogo) {
    if (!acceptedType.includes(req.files.stateLogo.mimetype)) {
      logoErrors.push({
        key: 'stateLogo',
        message: 'Harap menggunakan tipe file png, jpg, atau jpeg'
      })
    }
  }

  req.logoErrors = logoErrors

  next()
}

exports.coverUpdateValidation = (req, res, next) => {
  const coverErrors = []
  const acceptedType = ['image/png', 'image/jpg', 'image/jpeg']
  if (req.files && req.files.coverPhoto) {
    if (!acceptedType.includes(req.files.coverPhoto.mimetype)) {
      coverErrors.push({
        key: 'coverPhoto',
        message: 'Harap menggunakan tipe file png, jpg, atau jpeg'
      })
    }
  }

  req.coverErrors = coverErrors

  next()
}

exports.verifyAttendanceValidation = [
  check('attendanceCode').notEmpty().withMessage('Code Kehadiran tidak boleh kosong')
]

exports.createRegisterValidation = async (req, res, next) => {
  const stateRegistration = require('../models/stateRegistration.model')
  const stateActivities = require('../models/stateActivities.model')

  const { stateID } = req.body
  const nim = req.query.nim

  try {
    const dbRegistrationNim = await stateRegistration.query().where({ nim })

    const dbRegistrationDay = await stateRegistration.query()
      .select('state_activities.day')
      .where('state_registration.nim', nim)
      .join(
        'state_activities',
        'state_activities.stateID',
        'state_registration.stateID'
      )

    const dbActivities = await stateActivities.query().where('stateID', stateID)

    // Validasi apakah ada statenya atau tidak
    if (dbActivities.length === 0) {
      return res.status(400).send({
        message: 'Al??, Dreamers! Maaf, STATE ini belum tersedia'
      })
    }

    // Validasi State penuh
    if (dbActivities[0].registered >= dbActivities[0].quota) {
      return res.status(409).send({
        message: 'Al??, Dreamers! Maaf, STATE ini sudah penuh!'
      })
    }

    // Validasi State 1 orang tidak bisa pesan di hari yang sama
    const registeredDay = []
    for (let i = 0; i < dbRegistrationDay.length; i++) {
      registeredDay.push(dbRegistrationDay[i].day)
    }

    for (let i = 0; i < dbRegistrationDay.length; i++) {
      if (registeredDay[i] === dbActivities[0].day) {
        return res.status(409).send({
          message: 'Al??, Dreamers! Kamu hanya dapat mendaftar pada satu STATE pada hari yang sama'
        })
      }
    }

    // Validasi 1 orang hanya bisa pesan maks 3 state
    if (dbRegistrationNim.length >= 3) {
      return res.status(409).send({
        message: 'Al??, Dreamers! Maaf, kamu hanya dapat mendaftar maksimal 3 STATE'
      })
    }

    next()
  } catch (err) {
    return res.status(500).send({ message: 'Al??, Dreamers! Maaf, terjadi kesalahan pada server' })
  }
}

exports.runValidation = (req, res, next) => {
  const errors = validationResult(req).errors
  const logoErrors = req.logoErrors
  const coverErrors = req.coverErrors

  const listErrors = []

  if (errors.length !== 0) {
    errors.map(error => {
      listErrors.push({
        key: error.param,
        message: error.msg
      })
    })
  }

  if (logoErrors !== undefined && logoErrors.length !== 0) {
    listErrors.push(logoErrors[0])
  }

  if (coverErrors !== undefined && coverErrors.length !== 0) {
    listErrors.push(coverErrors[0])
  }

  if (listErrors.length !== 0) return res.status(400).send(listErrors)

  next()
}
