const homeInformation = require('../../home/models/homeInformation.model')
const homeMedia = require('../../home/models/homeMedia.model')
const chapterDialogues = require('../models/chapters.model')

exports.getChapter = async (req, res) => {
  const { homeChapterID } = req.params

  try {
    const dbChapter = await chapterDialogues.query()
      .where({ homeChapterID })

    const dbHome = await homeInformation.query()
      .where({ kategori: dbChapter[0].homeChapterID })

    for (let i = 0; i < dbHome.length; i++) {
      const dbHomeMedia = await homeMedia.query()
        .select('photoID', 'linkMedia')
        .where({ homeID: dbHome[i].homeID })

      dbHome[i].home_media = dbHomeMedia
    }

    dbChapter[0].home = dbHome

    return res.status(200).send(dbChapter)
  } catch (err) {
    return res.status(500).send({
      message: err.message
    })
  }
}

exports.updateChapter = async (req, res) => {
  const { homeChapterID } = req.params
  const { title, message } = req.body

  try {
    const dbChapter = await chapterDialogues.query().where({ homeChapterID })

    if (dbChapter.length === 0) {
      return res.status(400).send({
        message: 'Maaf chapter belum tersedia'
      })
    }

    await chapterDialogues.query()
      .update({
        title,
        message
      })
      .where({ homeChapterID })

    return res.status(200).send({
      message: 'Chapter berhasil diupdate'
    })
  } catch (err) {
    return res.status(500).send({
      message: err.message
    })
  }
}
