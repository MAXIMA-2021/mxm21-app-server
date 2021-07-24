const mahasiswaController = require('../controllers/mahasiswa.controller')
const validation = require('../validations/validate')
const authJWT = require('../middleware/authjwt.middleware')

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    )
    next()
  })

  app.get(
    '/api/panitia/acc/getMahasiswa',
    authJWT.verifyToken, authJWT.isPanitia,
    mahasiswaController.getMahasiswa
  )

  app.post(
    '/api/mhs/acc/signup',
    validation.mhsSignUpValidation, validation.runValidation,
    mahasiswaController.signUp
  )

  app.post(
    '/api/mhs/acc/signin',
    validation.signInValidation,
    validation.runValidation, mahasiswaController.signIn
  )

  app.put(
    '/api/mhs/acc/editProfile',
    authJWT.verifyToken, authJWT.isMahasiswa,
    validation.mhsUpdatedValidation, validation.runValidation,
    mahasiswaController.update
  )
}
