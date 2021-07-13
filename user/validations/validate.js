const {check, validationResult} = require('express-validator');

exports.mhsSignUpValidation = [
    check("nim").notEmpty().withMessage("Nim tidak boleh kosong"),
    check("name").notEmpty().withMessage("Nama tidak boleh kosong"),
    check("email").notEmpty().withMessage("Email tidak boleh kosong"),
    check("tempatLahir").notEmpty().withMessage("Tempat Lahir tidak boleh kosong"),
    check("tanggalLahir").notEmpty().withMessage("Tanggal Lahir tidak boleh kosong"),
    check("jenisKelamin").notEmpty().withMessage("Jenis kelamin tidak boleh kosong"),
    check("prodi").notEmpty().withMessage("Prodi tidak boleh kosong"),
    check("whatsapp").notEmpty().withMessage("Nomor Whatsapp tidak boleh kosong"),
    check("idLine").notEmpty().withMessage("Id Line tidak boleh kosong"),
    check("idInstagram").notEmpty().withMessage("Id Instagram tidak boleh kosong")
]

exports.panitiaSignUpValidation = [
    check("nim").notEmpty().withMessage("Nim tidak boleh kosong"),
    check("name").notEmpty().withMessage("Nama tidak boleh kosong"),
    check("email").notEmpty().withMessage("Email tidak boleh kosong"),
    check("password").notEmpty().withMessage("password tidak boleh kosong"),
    check("divisiID").notEmpty().withMessage("ID divisi tidak boleh kosong"),
]

exports.organizatorSignUpValidation = [
    check("nim").notEmpty().withMessage("Nim tidak boleh kosong"),
    check("name").notEmpty().withMessage("Nama tidak boleh kosong"),
    check("email").notEmpty().withMessage("Email tidak boleh kosong"),
    check("password").notEmpty().withMessage("password tidak boleh kosong"),
    check("stateID").notEmpty().withMessage("ID State tidak boleh kosong"),
]

exports.signInValidation = [
    check("nim").notEmpty().withMessage("Nim tidak boleh kosong"),
    check("password").notEmpty().withMessage("Password tidak boleh kosong")
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