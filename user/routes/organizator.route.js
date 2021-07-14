const organizatorController = require('../controllers/organizator.controller');
const validation = require('../validations/validate');

module.exports = function(app){
    app.use(function(req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
        next();
    });

    app.post(
        "/api/organizator/acc/signup",
        validation.organizatorSignUpValidation, validation.runValidation,
        organizatorController.signUp
    );

    app.post(
        "/api/organizator/acc/signin",
        validation.signInValidation, validation.runValidation,
        organizatorController.signIn
    );
}