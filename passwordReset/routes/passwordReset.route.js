const passwordResetController = require('../controllers/passwordReset.controller')
const validation = require('../validation/validate')
const authJWT = require('../../user/middleware/authjwt.middleware')

module.exports = (app) => {
  app.get(
    '/api/panitia/getPasswordReset',
    authJWT.verifyToken, authJWT.isPanitia,
    passwordResetController.getPasswordReset
  )

  app.get(
    '/api/panitia/getPasswordReset/:nim',
    authJWT.verifyToken, authJWT.isPanitia,
    passwordResetController.getPasswordReset
  )

  app.post(
    '/api/public/forgetPassword',
    validation.forgetPassword, validation.runValidation,
    passwordResetController.createPasswordReset
  )

  app.post(
    '/api/public/verifyOTP',
    validation.verifyOTP, validation.runValidation,
    passwordResetController.verifyOtp
  )
}
