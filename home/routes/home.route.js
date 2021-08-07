const homeController = require('../controllers/home.controller')
const validation = require('../validation/validate')
const authJwt = require('../../user/middleware/authjwt.middleware')
const toggle = require('../../toggle/middleware/toggle.middleware')

module.exports = function (app) {
  app.get(
    '/api/public/home',
    homeController.getPublicHomeData
  )

  app.get(
    '/api/public/home/:kategori',
    homeController.getPublicHomeData
  )

  app.post(
    '/api/panit/home',
    toggle.createHome, toggle.checkToggle,
    authJwt.verifyToken, authJwt.isPanitia,
    validation.insertHomeValidation,
    validation.insertLogoValidation,
    validation.runValidation,
    homeController.createHomeInformation
  )

  app.post(
    '/api/panit/home/:homeID',
    toggle.createHome, toggle.checkToggle,
    authJwt.verifyToken, authJwt.isPanitia,
    validation.insertMediaValidation,
    validation.runValidation,
    homeController.createHomeMedia
  )

  app.put(
    '/api/panit/home/information/:homeID',
    toggle.updateHome, toggle.checkToggle,
    authJwt.verifyToken, authJwt.isPanitia,
    validation.insertHomeValidation,
    validation.updateLogoValidation,
    validation.runValidation,
    homeController.updateHome
  )

  app.put(
    '/api/panit/home/media',
    toggle.updateHome, toggle.checkToggle,
    authJwt.verifyToken, authJwt.isPanitia,
    validation.updateMediaValidation, validation.runValidation,
    homeController.updateLinkMedia
  )

  app.delete(
    '/api/panit/home/:homeID',
    toggle.deleteHome, toggle.checkToggle,
    authJwt.verifyToken, authJwt.isPanitia,
    homeController.deleteHome
  )

  app.delete(
    '/api/panit/home/linkMedia/:photoID',
    toggle.deleteHome, toggle.checkToggle,
    authJwt.verifyToken, authJwt.isPanitia,
    homeController.deleteMedia
  )
}
