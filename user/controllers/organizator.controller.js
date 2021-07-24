/* eslint no-unused-vars: "off" */

const organizator = require('../models/organizator.model')
const stateActivities = require('../../state/models/stateActivities.model')
const jwt = require('jsonwebtoken')
const authConfig = require('../../config/auth.config')
const helper = require('../../helpers/helper')
const bcrypt = require('bcryptjs')
const panitia = require('../models/panitia.model')
const logging = require('../../mongoose/controllers/logging.mongoose')
const address = require('address')

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
    const errorLogging = logging.errorLogging('getOrganizator', 'Organizator', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.signUp = async (req, res) => {
  const {
    nim,
    name,
    email,
    password,
    stateID
  } = req.body

  const type = 'signUp/Organizator'

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

    const insertResult = await organizator.query().insert({
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
    const errorLogging = logging.errorLogging('signUp', 'Organizator', err.message)
    res.status(500).send({ message: err.message })
  }
}

exports.signIn = async (req, res) => {
  const { nim, password } = req.body

  const ip = address.ip()

  const type = 'signIn/Organizator'

  try {
    const dbOrganizator = await organizator.query().where('nim', nim)

    if (dbOrganizator.length === 0) { return res.status(404).send({ message: 'nim tidak terdaftar' }) }

    if (dbOrganizator[0].verified === 0) { return res.status(401).send({ message: 'Maaf akun anda belum diverifikasi oleh pihak pusat' }) }

    const isPasswordValid = bcrypt.compareSync(password, dbOrganizator[0].password)

    if (!isPasswordValid) { return res.status(401).send({ message: 'Password Invalid' }) }

    const token = jwt.sign({ nim: dbOrganizator[0].nim, stateID: dbOrganizator[0].stateID }, authConfig.jwt_key, {
      expiresIn: 21600
    })

    const loginLogging = logging.loginLogging(nim, ip)

    res.status(200).send({
      message: 'Berhasil Login',
      token: token
    })
  } catch (err) {
    const errorLogging = logging.errorLogging('signIn', 'Organizator', err.message)
    res.status(500).send({ message: err.message })
  }
}

exports.verifyNim = async (req, res) => {
  const nimOrganizator = req.params.nim

  const nim = req.nim

  const acceptedDivision = 'D01'

  let verified = 1

  const type = 'verify/Organizator'

  try {
    const checkNim = await panitia.query().where({ nim })

    if (checkNim[0].divisiID !== acceptedDivision) {
      return res.status(403).send({
        message: 'Anda tidak memiliki akses'
      })
    }

    const dbOrganizator = await organizator.query().where('nim', nimOrganizator)

    if (dbOrganizator.length === 0) {
      return res.status(404).send({
        message: 'nim tidak terdaftar'
      })
    }

    if (dbOrganizator[0].verified === 1) {
      verified = 0
    }

    const verifyOrganizator = await organizator.query().where('nim', nimOrganizator)
      .patch({
        verified
      })

    return res.status(200).send({
      message: 'Data berhasil diupdate'
    })
  } catch (err) {
    const errorLogging = logging.errorLogging('verifyNim', 'Organizator', err.message)
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
    const updateOrganizator = await organizator.query()
      .update({
        name,
        password: fixPassword
      })
      .where({ nim })

    return res.status(200).send({
      message: 'Update Profile Berhasil'
    })
  } catch (err) {
    const errorLogging = logging.errorLogging('update', 'Organizator', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}
