const panitiaController = require('../controllers/panitia.controller')
const validation = require('../validations/validate')
const authJwt = require('../middleware/authjwt.middleware')
const mainController = require('../controllers/main.controller')

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    )
    next()
  })

  app.get(
    '/api/panitia/acc/getPanitia',
    authJwt.verifyToken, authJwt.isPanitia,
    panitiaController.getPanitia
  )

  app.put(
    '/api/panitia/acc/verify/:nim',
    authJwt.verifyToken, authJwt.isPanitia,
    panitiaController.verifyNim
  )

  app.post(
    '/api/panitia/acc/signup',
    validation.panitiaSignUpValidation, validation.runValidation,
    panitiaController.signUp
  )

  app.post(
    '/api/panitia/acc/signin',
    validation.signInValidation, validation.runValidation,
    panitiaController.signIn
  )

  app.put(
    '/api/panitia/acc/editProfile',
    authJwt.verifyToken, authJwt.isPanitia,
    validation.panitiaUpdatedValidation, validation.runValidation,
    mainController.update
  )
}
