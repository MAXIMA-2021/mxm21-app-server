const stateActivities = require('../models/stateActivities.model')
const stateRegistration = require('../models/stateRegistration.model')
const dayManagement = require('../models/dayManagement.model')
const mahasiswa = require('../../user/models/mahasiswa.model')
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
        'state_registration.attendanceTime',
        'state_registration.inEventAttendance',
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
      .orderBy('day_management.day')

    if (dbState.length === 0) {
      return res.status(200).send(result)
    }

    const dateNow = new Date(Date.now())

    const remainingToken = 3 - dbState.length

    for (let i = 0; i < dbState.length; i++) {
      const tanggal = helper.createDate(dbState[i].date)

      const jam = helper.createTime(dbState[i].date)

      const dateOpen = (await dayManagement.query().where('day', 'D1'))[0].date

      const dateState = dbState[i].date

      const status = helper.createStatusState(dateNow, dateOpen, dateState)

      dbState[i].tanggal = tanggal
      dbState[i].jam = jam
      dbState[i].open = status
      state[i].hasRegistered = 1
      state[i].stateData = dbState[i]
    }

    result.remainingToken = remainingToken

    return res.status(200).send(result)
  } catch (err) {
    logging.errorLogging('getRegistrationMhs', 'Read/State_Registration', err.message)
    return res.status(500).send({
      message: 'Alô, Dreamers! Maaf, terjadi kesalahan pada server'
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

    for (let i = 0; i < dbState.length; i++) {
      const dbMahasiswa = await mahasiswa.query().where({ nim: dbState[i].nim })
      dbState[i].mahasiswa = dbMahasiswa[0].name
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
  const inEventAttendance = 0
  const exitAttendance = 0

  try {
    await stateRegistration.query()
      .insert({
        stateID,
        nim,
        queueNo,
        inEventAttendance,
        exitAttendance
      })

    const dbActivities = await stateActivities.query()
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
      .where('state_activities.stateID', stateID)

    await stateActivities.query()
      .where('stateID', stateID)
      .patch({
        registered: dbActivities[0].registered + 1
      })

    const dbMahasiswa = await mahasiswa.query().where('nim', nim)

    const mailjet = require('node-mailjet')
      .connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE)
    await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: 'web@mxm.one',
              Name: 'MAXIMA UMN 2021'
            },
            To: [
              {
                Email: `${dbMahasiswa[0].email}`,
                Name: `${dbMahasiswa[0].name}`
              }
            ],
            TemplateID: 3103966,
            TemplateLanguage: true,
            Subject: 'Pendaftaran STATE Berhasil',
            Variables: {
              nama_maba: `${dbMahasiswa[0].name}`,
              nama_ukm: `${dbActivities[0].name}`,
              tanggal_state: `${helper.createDate(dbActivities[0].date)}`
            }
          }
        ]
      })

    return res.status(200).send({
      message: 'Kamu berhasil melakukan registrasi pada STATE ini'
    })
  } catch (err) {
    logging.errorLogging('addRegistration', 'State_Registration', err.message)
    return res.status(500).send({ message: 'Alô, Dreamers! Maaf, terjadi kesalahan pada server' })
  }
}

exports.attendanceState = async (req, res) => {
  const { stateID } = req.params
  const { nim } = req.query
  const attendanceTime = helper.createAttendanceTime()
  const inEventAttendance = 1

  try {
    const checkRegistration = await stateRegistration.query()
      .select(
        'state_registration.*',
        'mahasiswa.name',
        'state_activities.zoomLink'
      )
      .join('mahasiswa', 'mahasiswa.nim', 'state_registration.nim')
      .join('state_activities', 'state_activities.stateID', 'state_registration.stateID')
      .where({
        'state_registration.stateID': stateID,
        'state_registration.nim': nim
      })

    if (checkRegistration.length === 0) {
      return res.status(400).send({ message: 'Alô, Dreamers! Kamu tidak terdaftar pada STATE tersebut, dicek lagi ya!' })
    }

    if (checkRegistration[0].queueNo === 0) {
      const lastQueueNumber = await stateRegistration.query().where({ stateID }).orderBy('queueNo')
      const queueNo = lastQueueNumber[lastQueueNumber.length - 1].queueNo + 1
      await stateRegistration.query()
        .where({
          stateID,
          nim
        })
        .patch({
          attendanceTime,
          inEventAttendance,
          queueNo
        })
    }
    const uname = `${checkRegistration[0].queueNo} - ${checkRegistration[0].name} - ${checkRegistration[0].nim}`
    const link = checkRegistration[0].zoomLink
    const zoom = `${link}&uname=${uname.split(' ').join('%20')}`

    return res.status(200).send({ message: zoom })
  } catch (err) {
    logging.errorLogging('attendanceState', 'State_Registration', err.message)
    return res.status(500).send({
      message: 'Alô, Dreamers! Maaf, terjadi kesalahan pada server'
    })
  }
}

exports.updateAttendance = async (req, res) => {
  const { stateID, nim } = req.params
  const { inEventAttendance } = req.body

  const nim_panit = req.nim

  const division = req.division

  const acceptedDivisi = ['D01', 'D02', 'D03']

  if (!acceptedDivisi.includes(division)) {
    return res.status(403).send({
      message: 'Divisi anda tidak memiliki otoritas yang cukup'
    })
  }

  try {
    const checkRegistration = await stateRegistration.query().where({
      stateID,
      nim
    })

    if (checkRegistration.length === 0) {
      return res.status(400).send({ message: 'Peserta tidak mendaftar pada STATE tersebut' })
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
  const tokenTime = helper.createAttendanceTime()

  try {
    const stateAttendanceDB = await stateRegistration.query()
      .select('state_activities.attendanceCode', 'state_registration.*')
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
      return res.status(400).send({
        message: 'Alô, Dreamers! Kamu tidak terdaftar pada STATE tersebut, dicek lagi ya!'
      })
    }

    if (stateAttendanceDB[0].attendanceTime === undefined) {
      return res.status(403).send({
        message: 'Alô, Dreamers! Kamu perlu masuk ke ZOOM terlebih dahulu sebelum melakukan absen!'
      })
    }

    if (stateAttendanceDB[0].inEventAttendance === 0) {
      return res.status(403).send({
        message: 'Alô, Dreamers! Kamu tidak mengikuti kegiatan STATE hingga selesai'
      })
    }

    if (attendanceCode === stateAttendanceDB[0].attendanceCode) {
      await stateRegistration.query()
        .patch({ exitAttendance, tokenTime })
        .where({ stateID, nim })

      return res.status(200).send({ message: 'Proses absensi selesai' })
    } else {
      return res.status(406).send({ message: 'Alô, Dreamers! Kode presensi yang kamu masukkan tidak sesuai, dicek lagi ya!' })
    }
  } catch (err) {
    logging.errorLogging('verifyAttendance', 'State_Registration', err.message)
    return res.status(500).send({ message: 'Alô, Dreamers! Maaf, terjadi kesalahan pada server' })
  }
}

exports.deleteRegistration = async (req, res) => {
  const { stateID } = req.params
  const { nim } = req.query

  try {
    const checkRegistration = await stateRegistration.query()
      .where({ nim, stateID })

    if (checkRegistration.length === 0) {
      return res.status(400).send({
        message: 'Alô, Dreamers! Kamu belum mendaftar pada STATE tersebut, dicek lagi ya!'
      })
    }

    await stateRegistration.query()
      .delete()
      .where({ nim, stateID })

    const registeredState = await stateActivities.query().where({ stateID })

    await stateActivities.query()
      .where({ stateID })
      .patch({
        registered: registeredState[0].registered - 1
      })

    const dbMahasiswa = await mahasiswa.query().where('nim', nim)

    const mailjet = require('node-mailjet')
      .connect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE)

    await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: 'web@mxm.one',
              Name: 'MAXIMA UMN 2021'
            },
            To: [
              {
                Email: `${dbMahasiswa[0].email}`,
                Name: `${dbMahasiswa[0].name}`
              }
            ],
            TemplateID: 3112985,
            TemplateLanguage: true,
            Subject: 'Pembatalan STATE Berhasil',
            Variables: {
              nama_maba: `${dbMahasiswa[0].name}`,
              nama_ukm: `${registeredState[0].name}`
            }
          }
        ]
      })

    return res.status(200).send({ message: 'Kamu berhasil menghapus registrasi pada STATE ini' })
  } catch (err) {
    logging.errorLogging('deleteRegistration', 'State_Registration', err.message)
    return res.status(500).send({ message: 'Alô, Dreamers! Maaf, terjadi kesalahan pada server' })
  }
}
