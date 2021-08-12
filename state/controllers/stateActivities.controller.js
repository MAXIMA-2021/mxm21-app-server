const stateActivities = require('../models/stateActivities.model')
const stateRegistration = require('../models/stateRegistration.model')
const organizator = require('../../user/models/organizator.model')
const fs = require('fs')
const helper = require('../../helpers/helper')
const { v4: uuidv4 } = require('uuid')
const logging = require('../../mongoose/controllers/logging.mongoose')

// Google Cloud Storage Library and Keys
const { Storage } = require('@google-cloud/storage')
const storage = new Storage({
  keyFilename: './keys/maxima-umn-2021-bucket-playground-key.json'
})

exports.getStateData = async (req, res) => {
  const { param } = req.query

  let result

  try {
    if (param === undefined) {
      result = await stateActivities.query()
        .select('day_management.date')
        .select('state_activities.*')
        .join(
          'day_management',
          'day_management.day',
          'state_activities.day'
        )
    } else {
      result = await stateActivities.query()
        .select('day_management.date')
        .select('state_activities.*')
        .join(
          'day_management',
          'day_management.day',
          'state_activities.day'
        )
        .where('state_activities.name', param)
        .orWhere('state_activities.stateID', param)
        .orWhere('state_activities.day', param)
    }

    if (result.length === 0) {
      return res.status(200).send(result)
    }

    for (let i = 0; i < result.length; i++) {
      const date = helper.createDate(result[i].date)
      const time = helper.createTime(result[i].date)
      result[i].tanggal = date
      result[i].jam = time
      result[i].lessQuota = result[i].quota - result[i].registered
    }

    return res.status(200).send(result)
  } catch (err) {
    logging.errorLogging('getStateData', 'State_Activities', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.getPublicStateData = async (req, res) => {
  try {
    const result = await stateActivities.query()
      .select('stateID', 'name', 'stateLogo')

    return res.status(200).send(result)
  } catch (err) {
    logging.errorLogging('getPublicStateData', 'State_Activities', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.addState = async (req, res) => {
  const nim = req.nim

  const division = req.division

  const acceptedDivisi = ['D01', 'D02', 'D03']

  if (!acceptedDivisi.includes(division)) {
    return res.status(403).send({
      message: 'Divisi anda tidak memiliki otoritas yang cukup'
    })
  }

  const {
    name,
    zoomLink,
    day,
    quota,
    identifier,
    category,
    shortDesc
  } = req.body

  const { stateLogo, coverPhoto } = req.files

  const attendanceCode = helper.createAttendanceCode(name)

  const dateTime = helper.createAttendanceTime()

  // format filename = nama state + nama file + datetime upload file
  const uuidLogo = uuidv4()
  const uuidCover = uuidv4()
  const fileNameLogo = `${name.trim().split(' ').join('-')}_${uuidLogo}_${stateLogo.name.trim().split(' ').join('-')}`
  const fileNameCover = `${name.trim().split(' ').join('-')}_${uuidCover}_${coverPhoto.name.trim().split(' ').join('-')}`

  const uploadPathLogo = './stateLogo/' + fileNameLogo
  const uploadPathCover = './stateLogo/' + fileNameCover

  const bucketName = 'mxm21-bucket-playground'

  const urlFileLogo = `https://storage.googleapis.com/${bucketName}/${fileNameLogo}`
  const urlFileCover = `https://storage.googleapis.com/${bucketName}/${fileNameCover}`

  try {
    const insertResult = await stateActivities.query().insert({
      name,
      zoomLink,
      day: `D${day}`,
      stateLogo: urlFileLogo,
      quota,
      registered: 0,
      attendanceCode,
      identifier,
      category,
      shortDesc,
      coverPhoto: urlFileCover
    })

    stateLogo.mv(uploadPathLogo, async (err) => {
      if (err) {
        logging.errorLogging('State_Activities', err.message)
        return res.status(500).send({ message: err.messsage })
      }

      await storage.bucket(bucketName).upload(uploadPathLogo)

      fs.unlink(uploadPathLogo, (err) => {
        if (err) {
          logging.errorLogging('addState', 'State_Activities', err.message)
          return res.status(500).send({ message: err.messsage })
        }
      })
    })

    coverPhoto.mv(uploadPathCover, async (err) => {
      if (err) {
        logging.errorLogging('State_Activities', err.message)
        return res.status(500).send({ message: err.messsage })
      }

      await storage.bucket(bucketName).upload(uploadPathCover)

      fs.unlink(uploadPathCover, (err) => {
        if (err) {
          logging.errorLogging('addState', 'State_Activities', err.message)
          return res.status(500).send({ message: err.messsage })
        }
      })
    })

    logging.stateLogging('insert/STATE', nim, insertResult, dateTime)

    return res.status(200).send({
      message: 'Data STATE berhasil ditambahkan'
    })
  } catch (err) {
    logging.errorLogging('addState', 'State_Activities', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.updateState = async (req, res) => {
  const {
    name,
    zoomLink,
    day,
    quota,
    identifier,
    category,
    shortDesc
  } = req.body

  const nim = req.nim

  const division = req.division

  const acceptedDivisi = ['D01', 'D02', 'D03']

  if (!acceptedDivisi.includes(division)) {
    return res.status(403).send({
      message: 'Divisi anda tidak memiliki otoritas yang cukup'
    })
  }

  const dateTime = helper.createAttendanceTime()

  const stateID = req.params.stateID

  const isProvide = await stateActivities.query().where('stateID', stateID)

  const checkName = await stateActivities.query().where('name', name)

  let attendanceCode = isProvide[0].attendanceCode

  if (checkName[0] && checkName[0].name !== isProvide[0].name) {
    return res.status(409).send({
      message: 'Maaf nama State sudah terdaftar sebelumnya'
    })
  } else if (!checkName[0]) {
    attendanceCode = helper.createAttendanceCode(name)
  }

  let stateLogo = null
  let coverPhoto = null
  let fileNameLogo = ''
  let fileNameCover = ''
  let uploadPathLogo = ''
  let uploadPathCover = ''
  let bucketName = ''
  let urlFileLogo = ''
  let urlFileCover = ''

  if (req.files && req.files.stateLogo) {
    stateLogo = req.files.stateLogo

    const uuidLogo = uuidv4()
    fileNameLogo = `${name.trim().split(' ').join('-')}_${uuidLogo}_${stateLogo.name.trim().split(' ').join('-')}`

    uploadPathLogo = './stateLogo/' + fileNameLogo

    bucketName = 'mxm21-bucket-playground'

    urlFileLogo = `https://storage.googleapis.com/${bucketName}/${fileNameLogo}`
  }

  if (req.files && req.files.coverPhoto) {
    coverPhoto = req.files.coverPhoto

    const uuidCover = uuidv4()
    fileNameCover = `${name.trim().split(' ').join('-')}_${uuidCover}_${coverPhoto.name.trim().split(' ').join('-')}`

    uploadPathCover = './stateLogo/' + fileNameCover

    bucketName = 'mxm21-bucket-playground'

    urlFileCover = `https://storage.googleapis.com/${bucketName}/${fileNameCover}`
  }

  let object1 = []
  let object2 = []

  try {
    if (uploadPathLogo) {
      await stateActivities.query().where('stateID', stateID).patch({
        name,
        zoomLink,
        day: `D${day}`,
        stateLogo: urlFileLogo,
        quota,
        attendanceCode,
        identifier,
        category,
        shortDesc
      })

      object1 = {
        name: isProvide[0].name,
        zoomLink: isProvide[0].zoomLink,
        day: isProvide[0].day,
        stateLogo: isProvide[0].stateLogo,
        quota: isProvide[0].quota,
        attendanceCode: isProvide[0].attendanceCode,
        identifier: isProvide[0].identifier,
        category: isProvide[0].category,
        shortDesc: isProvide[0].shortDesc
      }

      object2 = {
        name: name,
        zoomLink: zoomLink,
        day: `D${day}`,
        stateLogo: urlFileLogo,
        quota: parseInt(quota),
        attendanceCode: attendanceCode,
        identifier: identifier,
        category: category,
        shortDesc: shortDesc
      }

      stateLogo.mv(uploadPathLogo, async (err) => {
        if (err) {
          logging.errorLogging('updateState', 'State_Activities', err.message)
          return res.status(500).send({ message: err.messsage })
        }

        await storage.bucket(bucketName).upload(uploadPathLogo)

        fs.unlink(uploadPathLogo, (err) => {
          if (err) {
            logging.errorLogging('updateState', 'State_Activities', err.message)
            return res.status(500).send({ message: err.messsage })
          }
        })
      })
    }

    if (uploadPathCover) {
      await stateActivities.query().where('stateID', stateID).patch({
        name,
        zoomLink,
        day: `D${day}`,
        coverPhoto: urlFileCover,
        quota,
        attendanceCode,
        identifier,
        category,
        shortDesc
      })

      object1 = {
        name: isProvide[0].name,
        zoomLink: isProvide[0].zoomLink,
        day: isProvide[0].day,
        coverPhoto: isProvide[0].coverPhoto,
        quota: isProvide[0].quota,
        attendanceCode: isProvide[0].attendanceCode,
        identifier: isProvide[0].identifier,
        category: isProvide[0].category,
        shortDesc: isProvide[0].shortDesc
      }

      object2 = {
        name: name,
        zoomLink: zoomLink,
        day: `D${day}`,
        coverPhoto: urlFileCover,
        quota: parseInt(quota),
        attendanceCode: attendanceCode,
        identifier: identifier,
        category: category,
        shortDesc: shortDesc
      }

      coverPhoto.mv(uploadPathCover, async (err) => {
        if (err) {
          logging.errorLogging('updateState', 'State_Activities', err.message)
          return res.status(500).send({ message: err.messsage })
        }

        await storage.bucket(bucketName).upload(uploadPathCover)

        fs.unlink(uploadPathCover, (err) => {
          if (err) {
            logging.errorLogging('updateState', 'State_Activities', err.message)
            return res.status(500).send({ message: err.messsage })
          }
        })
      })
    }

    if (!req.files) {
      await stateActivities.query().where('stateID', stateID).patch({
        name,
        zoomLink,
        day: `D${day}`,
        quota,
        attendanceCode,
        identifier,
        category,
        shortDesc
      })

      object1 = {
        name: isProvide[0].name,
        zoomLink: isProvide[0].zoomLink,
        day: isProvide[0].day,
        quota: isProvide[0].quota,
        attendanceCode: isProvide[0].attendanceCode,
        identifier: isProvide[0].identifier,
        category: isProvide[0].category,
        shortDesc: isProvide[0].shortDesc
      }

      object2 = {
        name: name,
        zoomLink: zoomLink,
        day: `D${day}`,
        quota: parseInt(quota),
        attendanceCode: attendanceCode,
        identifier: identifier,
        category: category,
        shortDesc: shortDesc
      }
    }

    const fixObject = helper.createUpdatedObject(object1, object2)

    logging.stateLogging('update/STATE', nim, fixObject, dateTime)

    return res.status(200).send({
      message: 'Data STATE berhasil diupdate'
    })
  } catch (err) {
    logging.errorLogging('updateState', 'State_Activities', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.deleteState = async (req, res) => {
  const acceptedDivisi = ['D01', 'D02']

  const division = req.division

  if (!acceptedDivisi.includes(division)) {
    return res.status(403).send({
      message: 'Divisi anda tidak memiliki otoritas yang cukup'
    })
  }

  const stateID = req.params.stateID

  const isProvide = await stateActivities.query().where('stateID', stateID)

  if (isProvide.length === 0) return res.status(400).send({ message: 'State tidak ditemukan atau belum terdaftar' })

  try {
    await stateRegistration.query()
      .delete()
      .where('stateID', stateID)

    await organizator.query()
      .delete()
      .where('stateID', stateID)

    await stateActivities.query()
      .delete()
      .where('stateID', stateID)

    return res.status(200).send({
      message: 'Data State Berhasil Dihapus'
    })
  } catch (err) {
    logging.errorLogging('deleteState', 'State_Activities', err.message)
    return res.status(500).send({ message: err.message })
  }
}
