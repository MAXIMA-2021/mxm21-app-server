const malpunController = require('../controllers/malpun.controller');
const authjwtMiddleware = require('../../user/middleware/authjwt.middleware');

module.exports = function(app){
    app.get(
        '/api/panit/malpun',
        authjwtMiddleware.verifyToken, authjwtMiddleware.isPanitia,
        malpunController.getMalpunData
    );

    app.post(
        '/api/mhs/malpun',
        authjwtMiddleware.verifyToken, authjwtMiddleware.isMahasiswa,
        malpunController.registerMalpun
    );
}