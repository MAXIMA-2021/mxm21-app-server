const mainController = require('../controllers/main.controller')
const authJwt = require('../middleware/authjwt.middleware')

module.exports = (app) => {
  app.get(
    '/api/public/acc/checkToken',
    authJwt.verifyToken,
    mainController.checkToken
  )
}
