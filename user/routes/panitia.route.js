const panitaController = require('../controllers/panitia.controller');
const validation = require('../validations/validate');

module.exports = function(app) {
    app.use(function(req, res, next) {
    res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
    );
        next();
    });

    app.post(
        "/api/panitia/acc/signup", 
        validation.signUpValidation, validation.runValidation, 
        panitaController.signUp
    );

    app.post(
        "/api/panitia/acc/signin", 
        validation.signInValidation, validation.runValidation, 
        panitaController.signIn
    );        
}    