const stateActivities = require('../models/stateActivities.model')
const stateRegistration = require('../models/stateRegistration.model')
const organizator = require('../../user/models/organizator.model')
const fs = require('fs')
const helper = require('../../helpers/helper')
const { v4: uuidv4 } = require('uuid')
const logging = require('../../mongoose/controllers/logging.mongoose')
const toggleHelper = require('../../toggle/controllers/toggle.controller')
const toggle = require('../../toggle/models/toggle.model')

// Google Cloud Storage Library and Keys
const { Storage } = require('@google-cloud/storage')
const storage = new Storage({
  keyFilename: './keys/maxima-umn-2021-bucket-playground-key.json'
})

exports.getStateData = async (req, res) => {
  const param = req.query.param

  const id = 8

  const dbToggle = await toggle.query().where({ id })

  const status = toggleHelper.checkToggle(dbToggle[0].toggle)

  if (status === false) {
    return res.status(403).send({
      message: 'Closed'
    })
  }

  try {
    if (param === undefined) {
      const result = await stateActivities.query()
      return res.status(200).send(result)
    } else {
      const result = await stateActivities.query()
        .where('stateID', param)
        .orWhere('name', param)

      if (result.length === 0) {
        return res.status(404).send({
          message: 'State Tidak Ditemukan'
        })
      } else {
        return res.status(200).send(result)
      }
    }
  } catch (err) {
    logging.errorLogging('getStateData', 'State_Activities', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.getPublicStateData = async (req, res) => {
  const id = 8

  const dbToggle = await toggle.query().where({ id })

  const status = toggleHelper.checkToggle(dbToggle[0].toggle)

  if (status === false) {
    return res.status(403).send({
      message: 'Closed'
    })
  }

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

  const id = 7

  const dbToggle = await toggle.query().where({ id })

  const status = toggleHelper.checkToggle(dbToggle[0].toggle)

  if (status === false) {
    return res.status(403).send({
      message: 'Closed'
    })
  }

  const division = req.division

  const acceptedDivisi = ['D01', 'D02', 'D03']

  if (!acceptedDivisi.includes(division)) {
    return res.status(403).send({
      message: 'Forbidden'
    })
  }

  const {
    name,
    zoomLink,
    day,
    quota
  } = req.body

  const { stateLogo } = req.files

  const attendanceCode = helper.createAttendanceCode(name)

  const dateTime = helper.createAttendanceTime()

  // format filename = nama state + nama file + datetime upload file
  const uuid = uuidv4()
  const fileName = `${name}_${uuid}_${stateLogo.name}`

  const uploadPath = './stateLogo/' + fileName

  const bucketName = 'mxm21-bucket-playground'

  const urlFile = `https://storage.googleapis.com/${bucketName}/${fileName}`

  try {
    const insertResult = await stateActivities.query().insert({
      name,
      zoomLink,
      day,
      stateLogo: urlFile,
      quota,
      registered: 0,
      attendanceCode
    })

    stateLogo.mv(uploadPath, (err) => {
      if (err) {
        logging.errorLogging('State_Activities', err.message)
        return res.status(500).send({ message: err.messsage })
      }
    })

    await storage.bucket(bucketName).upload(uploadPath)

    logging.stateLogging('insert/STATE', nim, insertResult, dateTime)

    res.status(200).send({
      message: 'Data berhasil ditambahkan'
    })

    fs.unlink(uploadPath, (err) => {
      if (err) {
        logging.errorLogging('addState', 'State_Activities', err.message)
        return res.status(500).send({ message: err.messsage })
      }
    })
  } catch (err) {
    logging.errorLogging('addState', 'State_Activities', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.updateState = async (req, res) => {
  const { name, zoomLink, day, quota } = req.body

  const nim = req.nim

  const id = 9

  const dbToggle = await toggle.query().where({ id })

  const status = toggleHelper.checkToggle(dbToggle[0].toggle)

  if (status === false) {
    return res.status(403).send({
      message: 'Closed'
    })
  }

  const division = req.division

  const acceptedDivisi = ['D01', 'D02', 'D03']

  if (!acceptedDivisi.includes(division)) {
    return res.status(403).send({
      message: 'Forbidden'
    })
  }

  const dateTime = helper.createAttendanceTime()

  const stateID = req.params.stateID

  const isProvide = await stateActivities.query().where('stateID', stateID)

  const checkName = await stateActivities.query().where('name', name)

  let attendanceCode = isProvide[0].attendanceCode

  if (checkName[0] && checkName[0].name !== isProvide[0].name) {
    return res.status(409).send({
      message: 'Maaf nama State sudah terdaftar'
    })
  } else if (!checkName[0]) {
    attendanceCode = helper.createAttendanceCode(name)
  }

  let stateLogo = null
  let fileName = ''
  let uploadPath = ''
  let bucketName = ''
  let urlFile = ''

  if (req.files) {
    stateLogo = req.files.stateLogo

    const uuid = uuidv4()
    fileName = `${name}_${uuid}_${stateLogo.name}`

    uploadPath = './stateLogo/' + fileName

    bucketName = 'mxm21-bucket-playground'

    urlFile = `https://storage.googleapis.com/${bucketName}/${fileName}`
  }

  let objectData = []

  try {
    if (uploadPath) {
      await stateActivities.query().where('stateID', stateID).patch({
        name,
        zoomLink,
        day,
        stateLogo: urlFile,
        quota,
        attendanceCode
      })

      stateLogo.mv(uploadPath, (err) => {
        if (err) {
          logging.errorLogging('updateState', 'State_Activities', err.message)
          return res.status(500).send({ message: err.messsage })
        }
      })

      await storage.bucket(bucketName).upload(uploadPath)

      fs.unlink(uploadPath, (err) => {
        if (err) {
          logging.errorLogging('updateState', 'State_Activities', err.message)
          return res.status(500).send({ message: err.messsage })
        }
      })

      objectData = {
        name: name,
        zoomLink: zoomLink,
        day: day,
        stateLogo: urlFile,
        quota: quota,
        attendanceCode: attendanceCode
      }
    } else {
      await stateActivities.query().where('stateID', stateID).patch({
        name,
        zoomLink,
        day,
        quota,
        attendanceCode
      })

      objectData = {
        name: name,
        zoomLink: zoomLink,
        day: day,
        quota: quota,
        attendanceCode: attendanceCode
      }
    }

    logging.stateLogging('update/STATE', nim, objectData, dateTime)

    return res.status(200).send({
      message: 'Data berhasil diupdate'
    })
  } catch (err) {
    logging.errorLogging('updateState', 'State_Activities', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.deleteState = async (req, res) => {
  const id = 10

  const dbToggle = await toggle.query().where({ id })

  const status = toggleHelper.checkToggle(dbToggle[0].toggle)

  if (status === false) {
    return res.status(403).send({
      message: 'Closed'
    })
  }

  const acceptedDivisi = ['D01', 'D02']

  const division = req.division

  if (!acceptedDivisi.includes(division)) {
    return res.status(403).send({
      message: 'Forbidden'
    })
  }

  const stateID = req.params.stateID

  const isProvide = await stateActivities.query().where('stateID', stateID)

  if (isProvide.length === 0) return res.status(404).send({ message: 'State tidak ditemukan' })

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
