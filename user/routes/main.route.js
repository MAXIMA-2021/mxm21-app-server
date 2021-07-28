const mainController = require('../controllers/main.controller')
const authJwt = require('../middleware/authjwt.middleware')
const validation = require('../validations/validate')

module.exports = (app) => {
  app.get(
    '/api/public/acc/checkToken',
    authJwt.verifyToken,
    mainController.checkToken
  )

  app.put(
    '/api/organizator/acc/editProfile',
    authJwt.verifyToken, authJwt.isOrganizator,
    validation.notMhsUpdatedValidation, validation.runValidation,
    mainController.update
  )

  app.put(
    '/api/panitia/acc/editProfile',
    authJwt.verifyToken, authJwt.isPanitia,
    validation.notMhsUpdatedValidation, validation.runValidation,
    mainController.update
  )
}