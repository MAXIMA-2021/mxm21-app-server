/* eslint no-useless-escape: "off" */

const homeInformation = require('../models/homeInformation.model')
const homeMedia = require('../models/homeMedia.model')
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

      const dbHomeMedia = await homeMedia.query()
        .select('photoID', 'linkMedia')
        .where({ homeID: dbHome[0].homeID })

      dbHome[0].home_media = dbHomeMedia
    } else if (kategori !== undefined) {
      dbHome = await homeInformation.query().where({ kategori })

      const dbHomeMedia = await homeMedia.query()
        .select('photoID', 'linkMedia')
        .where({ homeID: dbHome[0].homeID })

      dbHome[0].home_media = dbHomeMedia
    }

    return res.status(200).send(dbHome)
  } catch (err) {
    logging.errorLogging('getPublicHomeData', 'HoME', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.createHomeInformation = async (req, res) => {
  const acceptedDivision = ['D01', 'D02', 'D03']

  const division = req.division

  if (!acceptedDivision.includes(division)) {
    return res.status(403).send({
      message: 'Divisi anda tidak memiliki otoritas yang cukup.'
    })
  }

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

  const fixName = name.trim()

  const searchKey = fixName.toLowerCase().split(' ').join('-')

  const { linkLogo } = req.files

  const bucketName = 'mxm21-home'

  const logoUuid = uuidv4()

  // format file logo
  const logoFileName = `${name.trim().split(' ').join('-')}_${logoUuid}_${linkLogo.name.trim().split(' ').join('-')}`

  const logoUploadPath = `./homeLogo/${logoFileName}`

  const logoUrlFile = `https://storage.googleapis.com/${bucketName}/${logoFileName}`

  let objectData = []

  try {
    const checkSearchKey = await homeInformation.query().where({ search_key: searchKey })

    if (checkSearchKey.length !== 0) {
      return res.status(409).send({
        message: 'Nama ini telah terdaftar sebelumnya.'
      })
    }

    await homeInformation.query().insert({
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

    linkLogo.mv(logoUploadPath, async (err) => {
      if (err) {
        logging.errorLogging('createHomeInformation', 'HoME', err.message)
        return res.status(500).send({
          message: err.message
        })
      }

      await storage.bucket(bucketName).upload(logoUploadPath)

      fs.unlink(logoUploadPath, (err) => {
        if (err) {
          logging.errorLogging('createHomeInformation', 'HoME', err.message)
          return res.status(500).send({
            message: err.message
          })
        }
      })
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

    logging.homeLogging('insert/HoME_Information', nim, objectData, dateTime)

    return res.status(200).send({
      message: 'Home berhasil terdaftar'
    })
  } catch (err) {
    logging.errorLogging('createHomeInformation', 'HoME', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.createHomeMedia = async (req, res, next) => {
  const acceptedDivision = ['D01', 'D02', 'D03']

  const division = req.division

  if (!acceptedDivision.includes(division)) {
    return res.status(403).send({
      message: 'Divisi anda tidak memiliki otoritas yang cukup.'
    })
  }

  const { homeID } = req.params

  const nim = req.nim

  const mediaFileName = []
  const mediaUploadPath = []
  const mediaUrlFile = []

  let { linkMedia } = req.files

  const dateTime = helper.createAttendanceTime()

  const dbHome = await homeInformation.query().where({ homeID })

  if (dbHome.length === 0) {
    return res.status(400).send({
      message: 'Home tidak tersedia atau belum terdaftar'
    })
  }

  const bucketName = 'mxm21-home'

  let objectData = []

  if (linkMedia && linkMedia.length === undefined) {
    linkMedia = [linkMedia]
  }

  for (let i = 0; i < linkMedia.length; i++) {
    const mediaUuid = uuidv4()
    mediaFileName.push(`${dbHome[0].name.trim().split(' ').join('-')}_${mediaUuid}_${linkMedia[i].name.trim().split(' ').join('-')}`)
    mediaUploadPath.push(`./homeMedia/${mediaFileName[i]}`)
    mediaUrlFile.push(`https://storage.googleapis.com/${bucketName}/${mediaFileName[i]}`)
  }

  try {
    for (let i = 0; i < mediaUploadPath.length; i++) {
      await homeMedia.query().insert({
        homeID,
        linkMedia: mediaUrlFile[i]
      })

      linkMedia[i].mv(mediaUploadPath[i], async (err) => {
        if (err) {
          logging.errorLogging('createHomeMedia', 'HoME', err.message)
          return res.status(500).send({ message: err.message })
        }

        await storage.bucket(bucketName).upload(mediaUploadPath[i])

        fs.unlink(mediaUploadPath[i], (err) => {
          if (err) {
            logging.errorLogging('createHomeMedia', 'HoME', err.message)
            return res.status(500).send({
              message: err.message
            })
          }
        })
      })
    }

    objectData = {
      homeID: homeID,
      homeMedia: mediaUrlFile
    }

    logging.homeLogging('insert/HoME_Media', nim, objectData, dateTime)

    return res.status(200).send({
      message: 'Media Berhasil Ditambahkan'
    })
  } catch (err) {
    logging.errorLogging('createHomeMedia', 'HoME', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.updateHome = async (req, res) => {
  const acceptedDivision = ['D01', 'D02', 'D03']

  const division = req.division

  if (!acceptedDivision.includes(division)) {
    return res.status(403).send({
      message: 'Divisi anda tidak memiliki otoritas yang cukup'
    })
  }

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

  const fixName = name.trim()

  const searchKey = fixName.toLowerCase().split(' ').join('-')

  let linkLogo = null
  let dateFile = ''
  let timeFile = ''
  let logoFileName = ''
  let logoUploadPath = ''
  let logoUrlFile = ''

  const bucketName = 'mxm21-home'

  const dateTime = helper.createAttendanceTime()

  let object1 = []
  let object2 = []

  if (req.files) {
    linkLogo = req.files.linkLogo

    dateFile = (helper.createAttendanceTime().split(' ')[0].split('-').join(''))
    timeFile = (helper.createAttendanceTime().split(' ')[1].split(':').join(''))

    logoFileName = `${name.trim().split(' ').join('-')}_${dateFile.concat(timeFile)}_${linkLogo.name.trim().split(' ').join('-')}`

    logoUploadPath = `./homeLogo/${logoFileName}`

    logoUrlFile = `https://storage.googleapis.com/${bucketName}/${logoFileName}`
  }

  try {
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
      await homeInformation.query()
        .where({ homeID })
        .patch({
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

      linkLogo.mv(logoUploadPath, async (err) => {
        if (err) {
          logging.errorLogging('updateHomeInformation', 'HoME', err.message)
          return res.status(500).send({
            message: err.message
          })
        }

        await storage.bucket(bucketName).upload(logoUploadPath)

        fs.unlink(logoUploadPath, (err) => {
          if (err) {
            logging.errorLogging('updateHomeInformation', 'HoME', err.message)
            return res.status(500).send({
              message: err.message
            })
          }
        })
      })

      object1 = {
        search_key: dbHome1[0].search_key,
        linkLogo: dbHome1[0].linkLogo,
        name: dbHome1[0].name,
        kategori: dbHome1[0].kategori,
        shortDesc: dbHome1[0].shortDesc,
        longDesc: dbHome1[0].longDesc,
        instagram: dbHome1[0].instagram,
        lineID: dbHome1[0].lineID,
        linkYoutube: dbHome1[0].linkYoutube
      }

      object2 = {
        search_key: searchKey,
        linkLogo: logoUrlFile,
        name: fixName,
        kategori: kategori,
        shortDesc: shortDesc,
        longDesc: longDesc,
        instagram: instagram,
        lineID: lineID,
        linkYoutube: linkYoutube
      }
    } else {
      await homeInformation.query()
        .where({ homeID })
        .patch({
          search_key: searchKey,
          name: fixName,
          kategori,
          shortDesc,
          longDesc,
          instagram,
          lineID,
          linkYoutube
        })

      object1 = {
        search_key: dbHome1[0].search_key,
        name: dbHome1[0].name,
        kategori: dbHome1[0].kategori,
        shortDesc: dbHome1[0].shortDesc,
        longDesc: dbHome1[0].longDesc,
        instagram: dbHome1[0].instagram,
        lineID: dbHome1[0].lineID,
        linkYoutube: dbHome1[0].linkYoutube
      }

      object2 = {
        search_key: searchKey,
        name: fixName,
        kategori: kategori,
        shortDesc: shortDesc,
        longDesc: longDesc,
        instagram: instagram,
        lineID: lineID,
        linkYoutube: linkYoutube
      }
    }

    const fixObject = helper.createUpdatedObject(object1, object2)

    logging.homeLogging('update/HoME_Information', nim, fixObject, dateTime)

    return res.status(200).send({
      message: 'Home berhasil diupdate'
    })
  } catch (err) {
    logging.errorLogging('updateHomeInformation', 'HoME', err.message)
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.updateLinkMedia = async (req, res) => {
  const acceptedDivision = ['D01', 'D02', 'D03']

  const division = req.division

  if (!acceptedDivision.includes(division)) {
    return res.status(403).send({
      message: 'Divisi anda tidak memiliki otoritas yang cukup'
    })
  }

  const nim = req.nim

  const { photoID } = req.body

  const bucketName = 'mxm21-home'

  const dateTime = helper.createAttendanceTime()

  let { linkMedia } = req.files

  const objectData = []

  if (linkMedia && linkMedia.length === undefined) {
    linkMedia = [linkMedia]
  }

  try {
    for (let i = 0; i < photoID.length; i++) {
      const dbHome = await homeMedia.query()
        .select('home_information.*')
        .join(
          'home_information',
          'home_information.homeID',
          'home_media.homeID'
        )
        .where('home_media.photoID', photoID[i])

      const uuid = uuidv4()
      const fileName = `${dbHome[0].name.trim().split(' ').join('-')}_${uuid}_${linkMedia[i].name.trim().split(' ').join('-')}`
      const uploadPath = `./homeMedia/${fileName}`
      const urlFile = `https://storage.googleapis.com/${bucketName}/${fileName}`

      linkMedia[i].mv(uploadPath, async (err) => {
        if (err) {
          logging.errorLogging('updateHomeMedia', 'HoME', err.message)
          return res.status(500).send({
            message: err.message
          })
        }
        await storage.bucket(bucketName).upload(uploadPath)

        fs.unlink(uploadPath, (err) => {
          if (err) {
            logging.errorLogging('updateHomeMedia', 'HoME', err.message)
            return res.status(500).send({
              message: err.message
            })
          }
        })
      })

      await homeMedia.query()
        .where({ photoID: photoID[i] })
        .update({
          linkMedia: urlFile
        })

      objectData.push({
        photoID: photoID[i],
        linkMedia: urlFile
      })
    }
    logging.homeLogging('update/HoME_Media', nim, objectData, dateTime)

    return res.status(200).send({
      message: 'linkMedia berhasil diupdate'
    })
  } catch (err) {
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.deleteMedia = async (req, res) => {
  const acceptedDivision = ['D01', 'D02']

  const division = req.division

  if (!acceptedDivision.includes(division)) {
    return res.status(403).send({
      message: 'Silakan kontak divisi Web MAXIMA untuk melakukan penghapusan HoME.'
    })
  }

  const { photoID } = req.params

  try {
    const isProvide = await homeMedia.query().where({ photoID })

    if (isProvide.length === 0) { return res.status(400).send({ message: 'Media tidak dapat ditemukan' }) }

    await homeMedia.query().delete().where({ photoID })

    return res.status(200).send({
      message: 'linkMedia berhasil dihapus'
    })
  } catch (err) {
    logging.errorLogging('deleteHomeMedia', 'HoME', err.message)
    return res.status(500).send({ message: err.message })
  }
}

exports.deleteHome = async (req, res) => {
  const acceptedDivision = ['D01', 'D02']

  const division = req.division

  if (!acceptedDivision.includes(division)) {
    return res.status(403).send({
      message: 'Silakan kontak divisi Web MAXIMA untuk melakukan penghapusan HoME.'
    })
  }

  const { homeID } = req.params

  try {
    const isProvide = await homeInformation.query().where('homeID', homeID)

    if (isProvide.length === 0) { return res.status(400).send({ message: 'Home tidak ditemukan atau belum terdaftar' }) }

    await homeMedia.query().delete().where({ homeID })

    await homeInformation.query().delete().where({ homeID })

    return res.status(200).send({ message: 'Data Home berhasil dihapus' })
  } catch (err) {
    logging.errorLogging('deleteHomeInformation', 'HoME', err.message)
    return res.status(500).send({ message: err.message })
  }
}
