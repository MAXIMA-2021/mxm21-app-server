const mahasiswaController = require('../controllers/mahasiswa.controller');
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
        "/api/mhs/acc/signup", 
        validation.mhsSignUpValidation, validation.runValidation, 
        mahasiswaController.signUp
    );

    app.post(
        "/api/mhs/acc/signin", 
        validation.signInValidation, 
        validation.runValidation, mahasiswaController.signIn
    );        
}    