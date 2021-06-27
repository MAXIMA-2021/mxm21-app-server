const authjwtMiddleware = require('../../user/middleware/authjwt.middleware');
const homeController = require('../controllers/home.controller');

module.exports = function(app){
    app.get('/api/home', authjwtMiddleware.verifyToken, authjwtMiddleware.isMahasiswa, homeController.getHome);
}
