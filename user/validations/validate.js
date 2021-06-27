const {check, validationResult} = require('express-validator');

exports.signUpValidation = [
    check("nama").notEmpty().withMessage("Nama tidak boleh kosong"),
    check("nim").notEmpty().withMessage("Nim tidak boleh kosong"),
    check("no_hp").notEmpty().withMessage("Nomor HP tidak boleh kosong"),
    check("email").notEmpty().withMessage("email tidak boleh kosong"),
    check("user_ig").notEmpty().withMessage("user instagram tidak boleh kosong"),
    check("id_line").notEmpty().withMessage("id line tidak boleh kosong"),
    check("tanggal_lahir").notEmpty().withMessage("Tanggal Lahir tidak boleh kosong")
]

exports.signInValidation = [
    check("nim").notEmpty().withMessage("Nim tidak boleh kosong"),
    check("tanggal_lahir").notEmpty().withMessage("Tanggal Lahir tidak boleh kosong")
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
        return res.status(500).send(listErrors);
    }
    next();
}