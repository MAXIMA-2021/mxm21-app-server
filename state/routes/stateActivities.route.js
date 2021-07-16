const stateActivitiesController = require('../controllers/stateActivities.controller')
const authjwtMiddleware = require('../../user/middleware/authjwt.middleware')
const validation = require('../validation/validate')

module.exports = function (app) {
  app.get(
    '/api/state/activities',
    authjwtMiddleware.verifyToken,
    stateActivitiesController.getStateData
  )

  app.post(
    '/api/state/activities',
    authjwtMiddleware.verifyToken, authjwtMiddleware.isPanitia,
    validation.createActivitiesValidation, validation.logoValidation, validation.runValidation,
    stateActivitiesController.addState
  )

  app.put(
    '/api/state/activities/:stateID',
    authjwtMiddleware.verifyToken, authjwtMiddleware.isPanitia,
    validation.updateActivitiesValidation, validation.logoUpdateValidation, validation.runValidation,
    stateActivitiesController.updateState
  )

  app.delete(
    '/api/state/activities/:stateID',
    authjwtMiddleware.verifyToken, authjwtMiddleware.isPanitia,
    stateActivitiesController.deleteState
  )
}
