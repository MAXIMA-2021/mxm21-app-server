const organizatorController = require('../controllers/organizator.controller')
const validation = require('../validations/validate')
const authJwt = require('../middleware/authjwt.middleware')

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    )
    next()
  })

  app.get(
    '/api/organizator/acc/getOrganizator',
    authJwt.verifyToken, authJwt.isPanitia,
    organizatorController.getOrganizator
  )

  app.post(
    '/api/organizator/acc/signup',
    validation.organizatorSignUpValidation, validation.runValidation,
    organizatorController.signUp
  )

  app.post(
    '/api/organizator/acc/signin',
    validation.signInValidation, validation.runValidation,
    organizatorController.signIn
  )

  app.put(
    '/api/organizator/acc/verify/:nim',
    authJwt.verifyToken, authJwt.isPanitia,
    organizatorController.verifyNim
  )

  app.put(
    '/api/organizator/acc/editProfile',
    authJwt.verifyToken, authJwt.isOrganizator,
    validation.organizatorUpdatedValidation, validation.runValidation,
    organizatorController.update
  )

  app.get(
    '/api/organizator/acc/checkToken',
    authJwt.verifyToken, authJwt.isOrganizator,
    organizatorController.checkToken
  )
}
