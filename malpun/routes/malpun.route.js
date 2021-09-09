const malpunController = require('../controllers/malpun.controller')
const authjwtMiddleware = require('../../user/middleware/authjwt.middleware')
const validation = require('../validation/validate')
const toggle = require('../../toggle/middleware/toggle.middleware')

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
    toggle.luckyNumber, toggle.checkToggle,
    validation.registerMalpun, validation.runValidation,
    malpunController.registerMalpun
  )
}
