const {check, validationResult} = require('express-validator');

exports.registerMalpun = [
    check("name").notEmpty().withMessage("Nama tidak boleh kosong"),
    check("email").notEmpty().withMessage("Email tidak boleh kosong")
]

exports.runValidation = (req, res, next)=>{
    const errors = validationResult(req).errors;
    const listErrors = [];
    if(errors.length !== 0){
        errors.map(error=>{
            listErrors.push({
                key: error.param,
                message: error.msg
            })
        })
        return res.status(400).send(listErrors);
    }
    next();
}