const { check, validationResult } = require('express-validator')

exports.createActivitiesValidation = [
  check('name').notEmpty().withMessage('Nama tidak boleh kosong'),
  check('zoomLink').notEmpty().withMessage('Link zoom tidak boleh kosong'),
  check('day').notEmpty().withMessage('Day tidak boleh kosong'),
  check('quota').notEmpty().withMessage('Jumlah quota tidak boleh kosong')
]

exports.logoValidation = (req, res, next) => {
  const logoErrors = []
  const acceptedType = ['image/png', 'image/jpg', 'image/jpeg']
  if (!req.files) {
    logoErrors.push({
      key: 'stateLogo',
      message: 'Gambar Logo tidak boleh kosong'
    })
  } else {
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

exports.updateActivitiesValidation = [
  check('name').notEmpty().withMessage('Nama tidak boleh kosong'),
  check('zoomLink').notEmpty().withMessage('Link zoom tidak boleh kosong'),
  check('day').notEmpty().withMessage('Day tidak boleh kosong'),
  check('quota').notEmpty().withMessage('Jumlah quota tidak boleh kosong')
]

exports.queryUpdateValidation = async (req, res, next) => {
  const stateActivities = require('../models/stateActivities.model')

  const { stateID } = req.params

  const { quota } = req.body

  const isProvide = await stateActivities.query().where('stateID', stateID)

  if (isProvide.length === 0) {
    return res.status(404).send({
      message: 'State tidak ditemukan'
    })
  }

  if (parseInt(quota) <= isProvide[0].registered) {
    return res.status(409).send({
      message: 'Jumlah Quota melebihi dari jumlah yang terdaftar'
    })
  }

  next()
}

exports.logoUpdateValidation = (req, res, next) => {
  const logoErrors = []
  const acceptedType = ['image/png', 'image/jpg', 'image/jpeg']
  if (req.files) {
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
      return res.status(404).send({
        message: 'Maaf state belum tersedia'
      })
    }

    // Validasi State penuh
    if (dbActivities[0].registered >= dbActivities[0].quota) {
      return res.status(409).send({
        message: 'Maaf, State sudah penuh!'
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
          message: 'Anda hanya dapat mendaftar satu state pada hari yang sama'
        })
      }
    }

    // Validasi 1 orang hanya bisa pesan maks 3 state
    if (dbRegistrationNim.length >= 3) {
      return res.status(409).send({
        message: 'Maaf Anda hanya dapat memesan maksimal 3 state'
      })
    }

    next()
  } catch (err) {
    return res.status(500).send({ message: err.message })
  }
}

exports.runValidation = (req, res, next) => {
  const errors = validationResult(req).errors
  const logoErrors = req.logoErrors
  const listErrors = []

  if (errors.length !== 0) {
    errors.map(error => {
      listErrors.push({
        key: error.param,
        message: error.msg
      })
    })
  }

  if (logoErrors !== undefined) {
    if (logoErrors.length !== 0) {
      listErrors.push(logoErrors[0])
    }
  }

  if (listErrors.length !== 0) return res.status(400).send(listErrors)

  next()
}
