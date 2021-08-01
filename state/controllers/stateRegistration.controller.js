const stateActivities = require('../models/stateActivities.model')
const stateRegistration = require('../models/stateRegistration.model')
const helper = require('../../helpers/helper')
const logging = require('../../mongoose/controllers/logging.mongoose')

exports.getRegistrationMhs = async (req, res) => {
  const { nim } = req.query

  const state = [
    {
      hasRegistered: 0,
      stateData: null
    },
    {
      hasRegistered: 0,
      stateData: null
    },
    {
      hasRegistered: 0,
      stateData: null
    }
  ]

  const result = {
    remainingToken: 3,
    state: state
  }

  try {
    const dbState = await stateActivities.query()
      .select(
        'state_activities.*',
        'day_management.date',
        'state_registration.exitAttendance'
      )
      .join(
        'state_registration',
        'state_registration.stateID',
        'state_activities.stateID'
      )
      .join(
        'day_management',
        'day_management.day',
        'state_activities.day'
      )
      .where('state_registration.nim', nim)

    if (dbState.length !== 0) {
      const remainingToken = 3 - dbState.length

      const tanggal = helper.createDate(dbState[0].date)

      const jam = helper.createTime(dbState[0].date)

      let expired = 0

      for (let i = 0; i < dbState.length; i++) {
        if (new Date(Date.now()) > dbState[i].date) {
          expired = 1
        }

        dbState[i].tanggal = tanggal
        dbState[i].jam = jam
        dbState[i].expired = expired
        state[i].hasRegistered = 1
        state[i].stateData = dbState[i]
      }

      result.remainingToken = remainingToken
    }

    return res.status(200).send(result)
  } catch (err) {
    logging.errorLogging('getRegistrationMhs', 'Read/State_Registration', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.getRegistration = async (req, res) => {
  const { stateID, nim } = req.query

  let dbState

  try {
    switch (true) {
      case stateID !== undefined :
        dbState = await stateRegistration.query()
          .select(
            'state_registration.*',
            'state_activities.*'
          )
          .join(
            'state_activities',
            'state_activities.stateID',
            'state_registration.stateID'
          )
          .where('state_registration.stateID', stateID)
        break
      case nim !== undefined :
        dbState = await stateRegistration.query()
          .select(
            'state_registration.*',
            'state_activities.*'
          )
          .join(
            'state_activities',
            'state_activities.stateID',
            'state_registration.stateID'
          )
          .where('state_registration.nim', nim)
        break
      default :
        dbState = await stateRegistration.query()
          .select(
            'state_registration.*',
            'state_activities.*'
          )
          .join(
            'state_activities',
            'state_activities.stateID',
            'state_registration.stateID'
          )
    }

    if (dbState.length === 0) {
      return res.status(404).send({
        message: 'Registrasi tidak dapat ditemukan'
      })
    }

    return res.status(200).send(dbState)
  } catch (err) {
    logging.errorLogging('getRegistration', 'Read/State_Registration', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.addRegistration = async (req, res) => {
  const { stateID } = req.body
  const { nim } = req.query
  const queueNo = 0
  const attendanceTime = 0
  const inEventAttendance = 0
  const exitAttendance = 0

  try {
    await stateRegistration.query()
      .insert({
        stateID,
        nim,
        queueNo,
        attendanceTime,
        inEventAttendance,
        exitAttendance
      })

    const dbActivities = await stateActivities.query().where('stateID', stateID)
    await stateActivities.query()
      .where('stateID', stateID)
      .patch({
        registered: dbActivities[0].registered + 1
      })

    return res.status(200).send({
      message: 'Anda berhasil mendaftar'
    })
  } catch (err) {
    logging.errorLogging('addRegistration', 'State_Registration', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.attendanceState = async (req, res) => {
  const { stateID } = req.params
  const { nim } = req.query
  const attendanceTime = helper.createAttendanceTime()
  const inEventAttendance = 1

  try {
    const checkRegistration = await stateRegistration.query().where({
      stateID,
      nim
    })

    if (checkRegistration.length === 0) {
      return res.status(404).send({ message: 'Anda tidak terdaftar1' })
    }

    await stateRegistration.query()
      .where({ stateID, nim })
      .patch({
        attendanceTime,
        inEventAttendance
      })

    return res.status(200).send({ message: 'Hadir' })
  } catch (err) {
    logging.errorLogging('attendanceState', 'State_Registration', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.updateAttendance = async (req, res) => {
  const { stateID, nim } = req.params
  const { inEventAttendance } = req.body

  const nim_panit = req.nim

  try {
    const checkRegistration = await stateRegistration.query().where({
      stateID,
      nim
    })

    if (checkRegistration.length === 0) {
      return res.status(404).send({ message: 'Peserta belum mendaftar' })
    }

    await stateRegistration.query()
      .where({
        stateID,
        nim
      })
      .patch({
        inEventAttendance: inEventAttendance
      })

    logging.attendancelogging('update_presensi_state_inevent', nim_panit, nim, stateID, inEventAttendance)

    return res.status(200).send({ message: 'Sudah diupdate' })
  } catch (err) {
    logging.errorLogging('updateAttendance', 'State_Registration', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.verifyAttendanceCode = async (req, res) => {
  const { stateID } = req.params
  const { nim } = req.query
  const { attendanceCode } = req.body
  const exitAttendance = 1

  try {
    const stateAttendanceDB = await stateRegistration.query()
      .select('state_activities.attendanceCode', 'state_registration.inEventAttendance')
      .where({
        'state_registration.stateID': stateID,
        'state_registration.nim': nim
      })
      .join(
        'state_activities',
        'state_activities.stateID',
        'state_registration.stateID'
      )

    if (stateAttendanceDB.length === 0) {
      return res.status(404).send({
        message: 'Anda belum mendaftar'
      })
    }

    if (stateAttendanceDB[0].inEventAttendance === 0) {
      return res.status(403).send({
        message: 'Anda tidak mengikuti state hingga akhir'
      })
    }

    if (attendanceCode === stateAttendanceDB[0].attendanceCode) {
      await stateRegistration.query()
        .patch({ exitAttendance })
        .where({ stateID, nim })

      return res.status(200).send({ message: 'Proses Absensi Selesai' })
    } else {
      return res.status(406).send({ message: 'Kode presensi salah' })
    }
  } catch (err) {
    logging.errorLogging('verifyAttendance', 'State_Registration', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.deleteRegistration = async (req, res) => {
  const { stateID } = req.params
  const { nim } = req.query

  try {
    const checkRegistration = await stateRegistration.query()
      .where({ nim, stateID })

    if (checkRegistration.length === 0) {
      return res.status(404).send({
        message: 'Anda belum mendaftar'
      })
    }

    await stateRegistration.query()
      .delete()
      .where({ nim, stateID })

    const registeredState = await stateActivities.query().select('registered')

    await stateActivities.query()
      .where({ stateID })
      .patch({
        registered: registeredState[0].registered - 1
      })

    return res.status(200).send({ message: 'Data Registrasi Berhasil Dihapus' })
  } catch (err) {
    logging.errorLogging('deleteRegistration', 'State_Registration', err.message)
    return res.status(500).send({ message: err.message })
  }
}
