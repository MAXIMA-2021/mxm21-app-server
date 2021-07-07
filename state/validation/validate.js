const {check, validationResult} = require('express-validator');

exports.createActivitiesValidation = [
    check("name").notEmpty().withMessage("Nama tidak boleh kosong"),
    check("zoomLink").notEmpty().withMessage("Link zoom tidak boleh kosong"),
    check("day").notEmpty().withMessage("Day tidak boleh kosong"),
    check("quota").notEmpty().withMessage("Jumlah quota tidak boleh kosong"),
    check("attendanceCode").notEmpty().withMessage("code kehadiran tidak boleh kosong") 
];

exports.logoValidation = (req, res, next)=>{
    const logoErrors = [];
    if(!req.files){
        logoErrors.push({
            key: "stateLogo",
            message: "Gambar Logo tidak boleh kosong"
        })
    }
    else{
        if(req.files.stateLogo.mimetype !== 'image/png'){
            if(req.files.stateLogo.mimetype !== 'image/jpg'){
                if(req.files.stateLogo.mimetype !== 'image/jpeg'){
                    logoErrors.push({
                        key: "stateLogo",
                        message: "Harap menggunakan tipe file png, jpg, atau jpeg"
                    })
                }
            }
        }
    }
    req.logoErrors = logoErrors;

    next();
}

exports.updateActivitiesValidation = [
    check("name").notEmpty().withMessage("Nama tidak boleh kosong"),
    check("zoomLink").notEmpty().withMessage("Link zoom tidak boleh kosong"),
    check("day").notEmpty().withMessage("Day tidak boleh kosong"),
    check("quota").notEmpty().withMessage("Jumlah quota tidak boleh kosong"),
    check("registered").notEmpty().withMessage("Jumlah yang terdaftar tidak boleh kosong"),
    check("attendanceCode").notEmpty().withMessage("code kehadiran tidak boleh kosong") 
]

exports.verifyAttendanceValidation = [
    check("attendanceCode").notEmpty().withMessage("Code Kehadiran tidak boleh kosong")
]

exports.createRegisterValidation = async (req, res, next)=>{
    const stateRegistration = require('../models/stateRegistration.model');
    const stateActivities = require('../models/stateActivities.model');

    const {stateID} = req.body;
    const nim = req.query.nim; 

    const dbRegistrationNim = await stateRegistration.query().where({nim});

    const dbRegistrationDay = await stateRegistration.query()
    .select('state_activities.day')
    .where('state_registration.nim', nim)
    .join(
        'state_activities', 
        'state_activities.stateID', 
        'state_registration.stateID'
    );

    const dbActivities = await stateActivities.query().where('stateID', stateID);

    //Validasi State penuh
    if(dbActivities[0].registered >= dbActivities[0].quota){
        return res.status(500).send({
            message: "Maaf, State sudah penuh!"
        })
    }

    //Validasi State 1 orang tidak bisa pesan di hari yang sama
    let registeredDay = [];
    for(let i = 0; i < dbRegistrationDay.length; i++){
        registeredDay.push(dbRegistrationDay[i].day)
    }
    
    for(let i = 0; i < dbRegistrationDay.length; i++){
        if(registeredDay[i] === dbActivities[0].day){
            return res.status(500).send({
                message: "Anda hanya dapat mendaftar satu state pada hari yang sama"
            })
        }
    }
    
    //Validasi 1 orang hanya bisa pesan maks 3 state
    if(dbRegistrationNim.length >= 3){
        return res.status(500).send({
            message: "Maaf Anda hanya dapat memesan maksimal 3 state"
        })
    }

    next();
}

exports.runValidation = (req, res, next)=>{

    const errors = validationResult(req).errors;
    const logoErrors = req.logoErrors;
    let listErrors = [];

    if(errors.length !== 0){
        errors.map(error=>{
            listErrors.push({
                key: error.param,
                message: error.msg
            })
        })
    }
    
    if(logoErrors.length !== 0){
        listErrors.push(logoErrors[0]);
    }
    
    if(listErrors.length !== 0) return res.status(500).send(listErrors)

    next();
}

