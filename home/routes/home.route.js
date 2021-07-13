const homeController = require('../controllers/home.controller');
const validation = require('../validation/validate');
const authJwt = require('../../user/middleware/authjwt.middleware');

module.exports = function(app){
    app.get(
        "/api/public/home",
        homeController.getHomeData
    )

    app.post(
        "/api/panit/home",
        authJwt.verifyToken, authJwt.isPanitia,
        validation.insertHomeValidation, validation.fileValidation,
        validation.runValidation,
        homeController.createHome
    )

    app.put(
        "/api/panit/home/:homeID",
        authJwt.verifyToken, authJwt.isPanitia,
        validation.insertHomeValidation, validation.updateFileValidation,
        validation.runValidation,
        homeController.updateHome
    )

    app.put(
        "/api/panit/home/linkMedia/:photoID",
        authJwt.verifyToken, authJwt.isPanitia,
        validation.updateFileValidation,validation.runValidation,
        homeController.updateLinkMedia
    )

    app.delete(
        "/api/panit/home/:homeID",
        authJwt.verifyToken, authJwt.isPanitia,
        homeController.deleteHome
    );
}