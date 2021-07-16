const stateRegistrationController = require('../controllers/stateRegistration.controller')
const authjwtMiddleware = require('../../user/middleware/authjwt.middleware')
const validation = require('../validation/validate')

module.exports = function (app) {
  app.get(
    '/api/panit/state/registration',
    authjwtMiddleware.verifyToken, authjwtMiddleware.isPanitia,
    stateRegistrationController.getRegistration
  )

  app.get(
    '/api/mhs/state/registration',
    authjwtMiddleware.verifyToken, authjwtMiddleware.isMahasiswa,
    stateRegistrationController.getRegistration
  )

  app.post(
    '/api/mhs/state/registration/registerState',
    authjwtMiddleware.verifyToken, authjwtMiddleware.isMahasiswa,
    validation.createRegisterValidation,
    stateRegistrationController.addRegistration
  )

  app.put(
    '/api/mhs/state/registration/attendZoom/:stateID',
    authjwtMiddleware.verifyToken, authjwtMiddleware.isMahasiswa,
    stateRegistrationController.attendanceState
  )

  app.put(
    '/api/panit/state/registration/updateAttendance/:stateID/:nim',
    authjwtMiddleware.verifyToken, authjwtMiddleware.isPanitia,
    stateRegistrationController.updateAttendance
  )

  app.put(
    '/api/mhs/state/registration/verifyAttendance/:stateID',
    authjwtMiddleware.verifyToken, authjwtMiddleware.isMahasiswa,
    validation.verifyAttendanceValidation, validation.runValidation,
    stateRegistrationController.verifyAttendanceCode
  )

  app.delete(
    '/api/mhs/state/registration/cancelState/:stateID',
    authjwtMiddleware.verifyToken, authjwtMiddleware.isMahasiswa,
    stateRegistrationController.deleteRegistration
  )
}
