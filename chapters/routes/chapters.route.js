const chapterController = require('../controllers/chapters.controller')
const authJWT = require('../../user/middleware/authjwt.middleware')
const validation = require('../validation/validate')

module.exports = (app) => {
  app.get(
    '/api/public/chapter/:homeChapterID',
    chapterController.getChapter
  )

  app.put(
    '/api/panit/chapter/:homeChapterID',
    authJWT.verifyToken,
    validation.chapterUpdateValidation, validation.runValidation,
    chapterController.updateChapter
  )
}
