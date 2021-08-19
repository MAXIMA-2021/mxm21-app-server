const mahasiswaController = require('../controllers/mahasiswa.controller')
const validation = require('../validations/validate')
const authJWT = require('../middleware/authjwt.middleware')
const toggle = require('../../toggle/middleware/toggle.middleware')

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
    toggle.signUpMahasiswa, toggle.checkToggle,
    mahasiswaController.signUp
  )

  app.post(
    '/api/mhs/acc/signin',
    validation.mhsSignInValidation,
    toggle.signInMahasiswa, toggle.checkToggle,
    validation.runValidation, mahasiswaController.signIn
  )

  app.put(
    '/api/panitia/acc/editMahasiswa/:nim',
    authJWT.verifyToken, authJWT.isPanitia,
    validation.mhsUpdatedValidation, validation.runValidation,
    mahasiswaController.advanceUpdate
  )

  app.get(
    '/api/mahasiswa/acc/checkToken',
    authJWT.verifyToken, authJWT.isMahasiswa,
    mahasiswaController.checkToken
  )
}
