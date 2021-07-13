const {check, validationResult} = require('express-validator');

exports.insertHomeValidation = [
    check("name").notEmpty().withMessage("Nama tidak boleh kosong"),
    check("kategori").notEmpty().withMessage("Kategori tidak boleh kosong"),
];

exports.fileValidation = (req, res, next)=>{
    const fileErrors = [];
    const acceptedType = ['image/png', 'image/jpg', 'image/jpeg'];
    
    if(!req.files){
        fileErrors.push({
            key: "linkLogo",
            message: "Gambar Logo tidak boleh kosong"
        })
    }
    else{
        if(!req.files.linkLogo){
            fileErrors.push({
                key: "linkLogo",
                message: "Gambar Logo tidak boleh kosong"
            })
        }
        else if(!acceptedType.includes(req.files.linkLogo.mimetype)){
            fileErrors.push({
                key: "linkLogo",
                message: "Gambar Logo harap menggunakan file png, jpg, atau jpeg"
            })
        }
        
        if(req.files.linkMedia){
            if(req.files.linkMedia.length === undefined){
                if(!acceptedType.includes(req.files.linkMedia.mimetype)){
                    fileErrors.push({
                        key: "linkMedia",
                        message: "Gambar Media harap menggunakan file png, jpg, atau jpeg"
                    })
                }
            }
            else{
                for(let i = 0; i < req.files.linkMedia.length; i++){
                    if(!acceptedType.includes(req.files.linkMedia[i].mimetype)){
                        fileErrors.push({
                            key: `linkMedia-${i+1}`,
                            message: "Gambar Media harap menggunakan file png, jpg, atau jpeg"
                        })
                    }
                }
            }
        }
    }
    
    req.fileErrors = fileErrors;

    next();
}

exports.updateFileValidation = (req, res, next)=>{
    const fileErrors = [];
    const acceptedType = ['image/png', 'image/jpg', 'image/jpeg'];

    if(req.files){
        if(req.files.linkLogo){ 
            if(!acceptedType.includes(req.files.linkLogo.mimetype)){
                fileErrors.push({
                    key: "linkLogo",
                    message: "Gambar Logo harap menggunakan file png, jpg, atau jpeg"
                })
            }
        }

        if(req.files.linkMedia){
            if(!acceptedType.includes(req.files.linkMedia.mimetype)){
                fileErrors.push({
                    key: "linkLogo",
                    message: "Gambar Media harap menggunakan file png, jpg, atau jpeg"
                })
            }
        }
    }

    req.fileErrors = fileErrors;

    next();
}

exports.runValidation = (req, res, next)=>{
    const errors = validationResult(req).errors;
    const fileErrors = req.fileErrors;
    const listErrors = [];

    if(errors.length !== 0){
        errors.map(error=>{
            listErrors.push({
                key: error.param,
                message: error.msg
            })
        })
    }

    if(fileErrors.length !== 0){
        listErrors.push(fileErrors[0]);
    }
    
    if(listErrors.length !== 0) return res.status(400).send(listErrors)

    next();
}