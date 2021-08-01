const stateRegistrationController = require('../controllers/stateRegistration.controller')
const authjwtMiddleware = require('../../user/middleware/authjwt.middleware')
const validation = require('../validation/validate')
const toggle = require('../../toggle/middleware/toggle.middleware')

module.exports = function (app) {
  app.get(
    '/api/mhs/state/registration',
    authjwtMiddleware.verifyToken, authjwtMiddleware.isMahasiswa,
    stateRegistrationController.getRegistrationMhs
  )

  app.get(
    '/api/panit/state/registration',
    authjwtMiddleware.verifyToken, authjwtMiddleware.isPanitia,
    stateRegistrationController.getRegistration
  )

  app.post(
    '/api/mhs/state/registration/registerState',
    toggle.stateRegistration, toggle.checkToggle,
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
    toggle.presensi, toggle.checkToggle,
    authjwtMiddleware.verifyToken, authjwtMiddleware.isPanitia,
    stateRegistrationController.updateAttendance
  )

  app.put(
    '/api/mhs/state/registration/verifyAttendance/:stateID',
    toggle.presensi, toggle.checkToggle,
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
