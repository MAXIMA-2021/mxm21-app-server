const malpunController = require('../controllers/malpun.controller')
const authjwtMiddleware = require('../../user/middleware/authjwt.middleware')
const validation = require('../validation/validate')

module.exports = function (app) {
  app.get(
    '/api/panit/malpun',
    authjwtMiddleware.verifyToken, authjwtMiddleware.isPanitia,
    malpunController.getMalpunData
  )

  app.get(
    '/api/panit/malpun/:nim',
    authjwtMiddleware.verifyToken, authjwtMiddleware.isPanitia,
    malpunController.getMalpunDataByNim
  )

  app.post(
    '/api/public/malpun',
    validation.registerMalpun, validation.runValidation,
    malpunController.registerMalpun
  )
}
