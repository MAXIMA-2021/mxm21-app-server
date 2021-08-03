const stateActivitiesController = require('../controllers/stateActivities.controller')
const authjwtMiddleware = require('../../user/middleware/authjwt.middleware')
const validation = require('../validation/validate')
const toggle = require('../../toggle/middleware/toggle.middleware')

module.exports = function (app) {
  app.get(
    '/api/state/activities',
    authjwtMiddleware.verifyToken,
    stateActivitiesController.getStateData
  )

  app.get(
    '/api/public/state',
    stateActivitiesController.getPublicStateData
  )

  app.post(
    '/api/state/activities',
    toggle.createState, toggle.checkToggle,
    authjwtMiddleware.verifyToken, authjwtMiddleware.isPanitia,
    validation.createActivitiesValidation, validation.logoValidation, validation.runValidation,
    stateActivitiesController.addState
  )

  app.put(
    '/api/state/activities/:stateID',
    toggle.updateState, toggle.checkToggle,
    authjwtMiddleware.verifyToken, authjwtMiddleware.isPanitia,
    validation.updateActivitiesValidation, validation.logoUpdateValidation, validation.runValidation, validation.queryUpdateValidation,
    stateActivitiesController.updateState
  )

  app.delete(
    '/api/state/activities/:stateID',
    toggle.deleteState, toggle.checkToggle,
    authjwtMiddleware.verifyToken, authjwtMiddleware.isPanitia,
    stateActivitiesController.deleteState
  )
}
