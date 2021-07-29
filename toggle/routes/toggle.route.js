const toggleController = require('../controllers/toggle.controller')
const authJWT = require('../../user/middleware/authjwt.middleware')

module.exports = function (app) {
  app.get(
    '/api/panitia/toggle',
    authJWT.verifyToken, authJWT.isPanitia,
    toggleController.getToggle
  )

  app.put(
    '/api/panitia/toggle/:id',
    authJWT.verifyToken, authJWT.isPanitia,
    toggleController.updateToggle
  )
}
