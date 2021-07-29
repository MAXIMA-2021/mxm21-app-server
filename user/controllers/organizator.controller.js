const organizator = require('../models/organizator.model')
const stateActivities = require('../../state/models/stateActivities.model')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.config')
const helper = require('../../helpers/helper')
const bcrypt = require('bcryptjs')
const logging = require('../../mongoose/controllers/logging.mongoose')
const address = require('address')
const toggleHelper = require('../../toggle/controllers/toggle.controller')
const toggle = require('../../toggle/models/toggle.model')

exports.getOrganizator = async (req, res) => {
  const { param } = req.query

  try {
    if (param === undefined) {
      const dbOrganizator = await organizator.query()
        .join('state_activities', 'state_activities.stateID', 'organizator.stateID')
        .select(
          'organizator.name',
          'organizator.nim',
          'state_activities.name as state',
          'organizator.verified'
        )

      return res.status(200).send(dbOrganizator)
    }

    const dbOrganizator = await organizator.query()
      .join('state_activities', 'state_activities.stateID', 'organizator.stateID')
      .select(
        'organizator.name',
        'organizator.nim',
        'state_activities.name as state',
        'organizator.verified'
      )
      .where('organizator.name', param)
      .orWhere('organizator.nim', param)
      .orWhere('state_activities.name', param)

    if (dbOrganizator.length === 0) {
      return res.status(404).send({
        message: 'Akun Tidak Ditemukan'
      })
    }

    return res.status(200).send(dbOrganizator)
  } catch (err) {
    logging.errorLogging('getOrganizator', 'Organizator', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.signUp = async (req, res) => {
  const id = 2

  const dbToggle = await toggle.query().where({ id })

  const status = toggleHelper.checkToggle(dbToggle[0].toggle)

  if (status === false) {
    return res.status(403).send({
      message: 'Closed'
    })
  }

  const {
    nim,
    name,
    email,
    password,
    stateID
  } = req.body

  const verified = 0

  const fixName = helper.toTitleCase(name)

  try {
    const result = await organizator.query().where('nim', nim)

    if (result.length !== 0) {
      return res.status(409).send({
        message: 'nim sudah terdaftar'
      })
    }

    const checkState = await stateActivities.query().where('stateID', stateID)

    if (checkState.length === 0) {
      return res.status(404).send({
        message: 'State tidak terdaftar'
      })
    }

    const fixPassword = bcrypt.hashSync(password, 8)

    await organizator.query().insert({
      nim,
      name: fixName,
      email,
      password: fixPassword,
      stateID,
      verified
    })

    res.status(200).send({
      message: 'Data berhasil ditambahkan'
    })
  } catch (err) {
    logging.errorLogging('signUp', 'Organizator', err.message)
    res.status(500).send({ message: err.message })
  }
}

exports.signIn = async (req, res) => {
  const { nim, password } = req.body

  const ip = address.ip()

  try {
    const dbOrganizator = await organizator.query().where('nim', nim)

    if (dbOrganizator.length === 0) { return res.status(404).send({ message: 'nim tidak terdaftar' }) }

    if (dbOrganizator[0].verified === 0) { return res.status(401).send({ message: 'Maaf akun anda belum diverifikasi oleh pihak pusat' }) }

    const isPasswordValid = bcrypt.compareSync(password, dbOrganizator[0].password)

    if (!isPasswordValid) { return res.status(401).send({ message: 'Password Invalid' }) }

    const token = jwt.sign({ nim: dbOrganizator[0].nim, stateID: dbOrganizator[0].stateID }, authConfig.jwt_key, {
      expiresIn: 21600
    })

    logging.loginLogging(nim, ip)

    res.status(200).send({
      message: 'Berhasil Login',
      token: token
    })
  } catch (err) {
    logging.errorLogging('signIn', 'Organizator', err.message)
    res.status(500).send({ message: err.message })
  }
}

exports.verifyNim = async (req, res) => {
  const nimOrganizator = req.params.nim

  const acceptedDivision = ['D01']

  const division = req.division

  if (!acceptedDivision.includes(division)) {
    return res.status(403).send({
      message: 'Forbidden'
    })
  }

  let verified = 1

  try {
    const dbOrganizator = await organizator.query().where('nim', nimOrganizator)

    if (dbOrganizator.length === 0) {
      return res.status(404).send({
        message: 'nim tidak terdaftar'
      })
    }

    if (dbOrganizator[0].verified === 1) {
      verified = 0
    }

    await organizator.query().where('nim', nimOrganizator)
      .patch({
        verified
      })

    return res.status(200).send({
      verify: verified
    })
  } catch (err) {
    logging.errorLogging('verifyNim', 'Organizator', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.update = async (req, res) => {
  const nim = req.nim

  const {
    name,
    password
  } = req.body

  const fixPassword = bcrypt.hashSync(password, 8)

  try {
    await organizator.query()
      .update({
        name,
        password: fixPassword
      })
      .where({ nim })

    return res.status(200).send({
      message: 'Update Profile Berhasil'
    })
  } catch (err) {
    logging.errorLogging('update', 'Organizator', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}
