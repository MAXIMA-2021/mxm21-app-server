const chapterController = require('../controllers/chapters.controller')

module.exports = (app) => {
  app.get(
    '/api/public/chapter/:homeChapterID',
    chapterController.getChapter
  )
}
