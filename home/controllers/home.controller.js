/* eslint-disable camelcase */

const homeInformation = require('../models/homeInformation.model')
const homeMedia = require('../models/homeMedia.model')
const panitia = require('../../user/models/panitia.model')
const helper = require('../../helpers/helper')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const logging = require('../../mongoose/controllers/logging.mongoose')

// Configure Google Cloud Storage
const { Storage } = require('@google-cloud/storage')
const storage = new Storage({
  keyFilename: './keys/maxima-umn-2021-bucket-playground-key.json'
})

exports.getPublicHomeData = async (req, res) => {
  const { organizator } = req.query

  const { kategori } = req.params

  let dbHome

  try {
    if (organizator === undefined && kategori === undefined) {
      dbHome = await homeInformation.query()

      for (let i = 0; i < dbHome.length; i++) {
        const dbHomeMedia = await homeMedia.query()
          .select('photoID', 'linkMedia')
          .where({ homeID: dbHome[i].homeID })

        dbHome[i].home_media = dbHomeMedia
      }
    } else if (organizator !== undefined) {
      dbHome = await homeInformation.query().where({ search_key: organizator })

      if (dbHome.length === 0) {
        return res.status(404).send({
          message: 'Home tidak tersedia'
        })
      }

      const dbHomeMedia = await homeMedia.query()
        .select('photoID', 'linkMedia')
        .where({ homeID: dbHome[0].homeID })

      dbHome[0].home_media = dbHomeMedia
    } else if (kategori !== undefined) {
      dbHome = await homeInformation.query().where({ kategori })

      if (dbHome.length === 0) {
        return res.status(404).send({
          message: 'Home tidak tersedia'
        })
      }

      const dbHomeMedia = await homeMedia.query()
        .select('photoID', 'linkMedia')
        .where({ homeID: dbHome[0].homeID })

      dbHome[0].home_media = dbHomeMedia
    }

    return res.status(200).send(dbHome)
  } catch (err) {
    const errorLogging = logging.errorLogging('getPublicHomeData', 'HoME', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.createHomeInformation = async (req, res) => {
  const acceptedDivision = ['D01', 'D02', 'D03']

  const nim = req.nim

  const {
    name,
    kategori,
    shortDesc,
    longDesc,
    linkYoutube,
    lineID,
    instagram
  } = req.body

  if (name.match(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi)) {
    return res.status(400).send({
      message: 'Nama diharapkan tidak terdapat unsur _ \ / : * ? " \' < > |'
    })
  }

  const dateTime = helper.createAttendanceTime()

  const fixName = helper.toTitleCase(name)

  const searchKey = name.toLowerCase().replace(' ', '-')

  const { linkLogo } = req.files

  const bucketName = 'mxm21-bucket-playground'

  const logoUuid = uuidv4()

  // format file logo
  const logoFileName = `${name}_${logoUuid}_${linkLogo.name}`

  const logoUploadPath = `./homeLogo/${logoFileName}`

  const logoUrlFile = `https://storage.googleapis.com/${bucketName}/${logoFileName}`

  let objectData = []

  try {
    const checkNim = await panitia.query().where({ nim })

    if (!acceptedDivision.includes(checkNim[0].divisiID)) {
      return res.status(403).send({
        message: 'Maaf divisi anda tidak diizinkan unuk mengaksesnya'
      })
    }

    const checkSearchKey = await homeInformation.query().where({ search_key: searchKey })

    if (checkSearchKey.length !== 0) {
      return res.status(409).send({
        message: 'Nama ini telah terdaftar sebelumnya.'
      })
    }

    const insertHomeInformation = await homeInformation.query().insert({
      search_key: searchKey,
      linkLogo: logoUrlFile,
      name: fixName,
      kategori,
      shortDesc,
      longDesc,
      instagram,
      lineID,
      linkYoutube
    })

    linkLogo.mv(logoUploadPath, (err) => {
      if (err) {
        const errorLogging = logging.errorLogging('createHomeInformation', 'HoME', err.message)
        return res.status(500).send({
          message: err.message
        })
      }
    })

    res_bucket = await storage.bucket(bucketName).upload(logoUploadPath)

    fs.unlink(logoUploadPath, (err) => {
      if (err) {
        const errorLogging = logging.errorLogging('createHomeInformation', 'HoME', err.message)
        return res.status(500).send({
          message: err.message
        })
      }
    })

    objectData = {
      search_key: searchKey,
      linkLogo: logoUrlFile,
      name: fixName,
      kategori: kategori,
      shortDesc: shortDesc,
      longDesc: longDesc,
      instagram: instagram,
      lineID: lineID,
      linkYoutube: linkYoutube,
      homeMedia: []
    }

    const homeLogging = logging.homeLogging('insert/HoME_Information', nim, objectData, dateTime)

    return res.status(200).send({
      message: 'Home berhasil terdaftar'
    })
  } catch (err) {
    const errorLogging = logging.errorLogging('createHomeInformation', 'HoME', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.createHomeMedia = async (req, res, next) => {
  const acceptedDivision = ['D01', 'D02', 'D03']

  const { homeID } = req.params

  const nim = req.nim

  const mediaFileName = []
  const mediaUploadPath = []
  const mediaUrlFile = []

  let { linkMedia } = req.files

  const dateTime = helper.createAttendanceTime()

  const dbHome = await homeInformation.query().where({ homeID })

  const dbHomeMedia = await homeMedia.query().where({ homeID })

  const checkNim = await panitia.query().where({ nim })

  if (!acceptedDivision.includes(checkNim[0].divisiID)) {
    return res.status(403).send({
      message: 'Maaf divisi anda tidak diizinkan untuk mengaksesnya'
    })
  }

  if (dbHome.length === 0) {
    return res.status(404).send({
      message: 'Maaf Home tidak tersedia'
    })
  }

  if (dbHomeMedia.length !== 0) {
    return res.status(409).send({
      message: 'Maaf Media pada Home ini sudah tersedia'
    })
  }

  const bucketName = 'mxm21-bucket-playground'

  let objectData = []

  if (linkMedia && linkMedia.length === undefined) {
    linkMedia = [linkMedia]
  }

  for (let i = 0; i < linkMedia.length; i++) {
    const mediaUuid = uuidv4()
    mediaFileName.push(`${dbHome[0].name}_${mediaUuid}_${linkMedia[i].name}`)
    mediaUploadPath.push(`./homeMedia/${mediaFileName[i]}`)
    mediaUrlFile.push(`https://storage.googleapis.com/${bucketName}/${mediaFileName[i]}`)
  }

  try {
    for (let i = 0; i < mediaUploadPath.length; i++) {
      const insertMedia = await homeMedia.query().insert({
        homeID,
        linkMedia: mediaUrlFile[i]
      })

      linkMedia[i].mv(mediaUploadPath[i], (err) => {
        if (err) {
          const errorLogging = logging.errorLogging('createHomeMedia', 'HoME', err.message)
          return res.status(500).send({ message: err.message })
        }
      })

      res_bucket = await storage.bucket(bucketName).upload(mediaUploadPath[i])

      fs.unlink(mediaUploadPath[i], (err) => {
        if (err) {
          const errorLogging = logging.errorLogging('createHomeMedia', 'HoME', err.message)
          return res.status(500).send({
            message: err.message
          })
        }
      })
    }

    objectData = {
      homeID: homeID,
      homeMedia: mediaUrlFile
    }

    const homeLogging = logging.homeLogging('insert/HoME_Media', nim, objectData, dateTime)

    return res.status(200).send({
      message: 'Media Berhasil Ditambahkan'
    })
  } catch (err) {
    const errorLogging = logging.errorLogging('createHomeMedia', 'HoME', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.updateHome = async (req, res) => {
  const acceptedDivision = ['D01', 'D02', 'D03']

  const nim = req.nim

  const {
    name,
    kategori,
    shortDesc,
    longDesc,
    linkYoutube,
    lineID,
    instagram
  } = req.body

  const { homeID } = req.params

  if (name.match(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi)) {
    return res.status(400).send({
      message: 'Nama diharapkan tidak terdapat unsur \ / : * ? " \' < > |'
    })
  }

  const searchKey = name.toLowerCase().replace(' ', '-')

  let linkLogo = null
  const linkMedia = null
  let dateFile = ''
  let timeFile = ''
  let logoFileName = ''
  let logoUploadPath = ''
  let logoUrlFile = ''

  const bucketName = 'mxm21-bucket-playground'

  const dateTime = helper.createAttendanceTime()

  let objectData = []

  if (req.files) {
    linkLogo = req.files.linkLogo

    dateFile = (helper.createAttendanceTime().split(' ')[0].split('-').join(''))
    timeFile = (helper.createAttendanceTime().split(' ')[1].split(':').join(''))

    logoFileName = `${name}_${dateFile.concat(timeFile)}_${linkLogo.name}`

    logoUploadPath = `./homeLogo/${logoFileName}`

    logoUrlFile = `https://storage.googleapis.com/${bucketName}/${logoFileName}`
  }

  try {
    const checkNim = await panitia.query().where({ nim })

    if (!acceptedDivision.includes(checkNim[0].divisiID)) {
      return res.status(403).send({
        message: 'Maaf divisi anda tidak diizinkan unuk mengaksesnya'
      })
    }

    const dbHome1 = await homeInformation.query().where({ homeID })

    const dbHome2 = await homeInformation.query().where({ search_key: searchKey })

    if (dbHome2.length !== 0) {
      if (dbHome1[0].search_key !== dbHome2[0].search_key) {
        return res.status(409).send({
          message: 'Nama ini telah terdaftar sebelumnya.'
        })
      }
    }

    if (logoUploadPath) {
      const updateHomeInformation = await homeInformation.query()
        .where({ homeID })
        .patch({
          search_key: searchKey,
          linkLogo: logoUrlFile,
          name,
          kategori,
          shortDesc,
          longDesc,
          instagram,
          lineID,
          linkYoutube
        })

      linkLogo.mv(logoUploadPath, (err) => {
        if (err) {
          const errorLogging = logging.errorLogging('updateHomeInformation', 'HoME', err.message)
          return res.status(500).send({
            message: err.message
          })
        }
      })

      res_bucket = await storage.bucket(bucketName).upload(logoUploadPath)

      fs.unlink(logoUploadPath, (err) => {
        if (err) {
          const errorLogging = logging.errorLogging('updateHomeInformation', 'HoME', err.message)
          return res.status(500).send({
            message: err.message
          })
        }
      })

      objectData = {
        homeID: homeID,
        search_key: searchKey,
        linkLogo: logoUrlFile,
        name: name,
        kategori: kategori,
        shortDesc: shortDesc,
        longDesc: longDesc,
        instagram: instagram,
        lineID: lineID,
        linkYoutube: linkYoutube
      }
    } else {
      const updateHomeInformation = await homeInformation.query()
        .where({ homeID })
        .patch({
          search_key: searchKey,
          name,
          kategori,
          shortDesc,
          longDesc,
          instagram,
          lineID,
          linkYoutube
        })

      objectData = {
        homeID: homeID,
        search_key: searchKey,
        name: name,
        kategori: kategori,
        shortDesc: shortDesc,
        longDesc: longDesc,
        instagram: instagram,
        lineID: lineID,
        linkYoutube: linkYoutube
      }
    }

    const homeLogging = logging.homeLogging('update/HoME_Information', nim, objectData, dateTime)

    return res.status(200).send({
      message: 'Home berhasil diupdate'
    })
  } catch (err) {
    const errorLogging = logging.errorLogging('updateHomeInformation', 'HoME', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.updateLinkMedia = async (req, res) => {
  const acceptedDivision = ['D01', 'D02', 'D03']

  const nim = req.nim

  const { photoID } = req.params

  const bucketName = 'mxm21-bucket-playground'

  const dateTime = helper.createAttendanceTime()

  let linkMedia = ''

  let objectData = []

  if (req.files) { linkMedia = req.files.linkMedia }

  try {
    const checkNim = await panitia.query().where({ nim })

    if (!acceptedDivision.includes(checkNim[0].divisiID)) {
      return res.status(403).send({
        message: 'Maaf divisi anda tidak diizinkan unuk mengaksesnya'
      })
    }

    const dbHome = await homeMedia.query()
      .select('home_information.*')
      .join(
        'home_information',
        'home_information.homeID',
        'home_media.homeID'
      )
      .where('home_media.photoID', photoID)

    if (linkMedia) {
      const uuid = uuidv4()

      const fileName = `${dbHome[0].name}_${uuid}_${linkMedia.name}`
      const uploadPath = `./homeMedia/${fileName}`
      const urlFile = `https://storage.googleapis.com/${bucketName}/${fileName}`

      const updateMedia = await homeMedia.query()
        .where({ photoID })
        .update({
          linkMedia: urlFile
        })

      linkMedia.mv(uploadPath, (err) => {
        if (err) {
          const errorLogging = logging.errorLogging('updateHomeMedia', 'HoME', err.message)
          return res.status(500).send({
            message: err.message
          })
        }
      })

      res_bucket = await storage.bucket(bucketName).upload(uploadPath)

      fs.unlink(uploadPath, (err) => {
        if (err) {
          const errorLogging = logging.errorLogging('updateHomeMedia', 'HoME', err.message)
          return res.status(500).send({
            message: err.message
          })
        }
      })

      objectData = {
        photoID: photoID,
        linkMedia: urlFile
      }
    }

    const homeLogging = logging.homeLogging('update/HoME_Media', nim, objectData, dateTime)

    return res.status(200).send({
      message: 'HomeMedia berhasil diupdate'
    })
  } catch (err) {
    const errorLogging = logging.errorLogging('updateHomeMedia', 'HoME', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.deleteMedia = async (req, res) => {
  const acceptedDivision = ['D01', 'D02']

  const nim = req.nim

  const { photoID } = req.params

  try {
    const checkNim = await panitia.query().where({ nim })

    if (!acceptedDivision.includes(checkNim[0].divisiID)) {
      return res.status(403).send({
        message: 'Maaf divisi anda tidak diizinkan unuk mengaksesnya'
      })
    }

    const isProvide = await homeMedia.query().where({ photoID })

    if (isProvide.length === 0) { return res.status(404).send({ message: 'Media tidak ditemukan' }) }

    const deleteMedia = await homeMedia.query().delete().where({ photoID })

    return res.status(200).send({
      message: 'linkMedia berhasil dihapus'
    })
  } catch (err) {
    const errorLogging = logging.errorLogging('deleteHomeMedia', 'HoME', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.deleteHome = async (req, res) => {
  const acceptedDivision = ['D01', 'D02']

  const nim = req.nim

  const { homeID } = req.params

  try {
    const checkNim = await panitia.query().where({ nim })

    if (!acceptedDivision.includes(checkNim[0].divisiID)) {
      return res.status(403).send({
        message: 'Maaf divisi anda tidak diizinkan unuk mengaksesnya'
      })
    }

    const isProvide = await homeInformation.query().where('homeID', homeID)

    if (isProvide.length === 0) { return res.status(404).send({ message: 'Home tidak ditemukan' }) }

    const deleteMedia = await homeMedia.query().delete().where({ homeID })
    const deleteHome = await homeInformation.query().delete().where({ homeID })

    return res.status(200).send({ message: 'Data Home berhasil dihapus' })
  } catch (err) {
    const errorLogging = logging.errorLogging('deleteHomeInformation', 'HoME', err.message)
    return res.status(500).send({ message: err.message })
  }
}
