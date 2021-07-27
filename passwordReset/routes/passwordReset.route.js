const passwordResetController = require('../controllers/passwordReset.controller')
const validation = require('../validation/validate')

module.exports = (app) => {
  app.get(
    '/api/panitia/getPasswordReset',
    passwordResetController.getPasswordReset
  )

  app.get(
    '/api/panitia/getPasswordReset/:nim',
    passwordResetController.getPasswordReset
  )

  app.post(
    '/api/public/forgetPassword',
    validation.forgetPassword, validation.runValidation,
    passwordResetController.createPasswordReset
  )

  app.post(
    '/api/public/verifyOTP',
    passwordResetController.verifyOtp
  )
}
