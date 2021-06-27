const jwt = require("jsonwebtoken");
const authConfig = require("../../config/auth.config");
const mahasiswa = require('../models/mahasiswa.model');
const panitia = require('../models/panitia.model');

exports.verifyToken = (req, res, next) => {
    const token = req.headers["x-access-token"];

    if(!token) return res.status(403).send({message: "Tidak ada token"});
    
    jwt.verify(token, authConfig.jwt_key, (err, decoded) => {
        if(err) return res.status(401).send({message: "Token Invalid"});
        
        req.nim = decoded.nim;
        next();
    })
}

exports.isMahasiswa = (req, res, next)=>{
    const nim = req.nim;
    mahasiswa.query().select('nim').where('nim', nim).then(result=>{
        if(result.length === 0) return res.status(401).send({message: 'Unauthorized'});

        next();
    })
    .catch(err=>{
        return res.status(500).send({message: err.message});
    })
}


exports.isPanitia = (req, res, next)=>{
    const nim = req.nim;
    panitia.query().select('nim').where('nim', nim).then(result=>{
        if(result.length === 0) return res.status(401).send({message: 'Unauthorized'});

        next();
    })
    .catch(err=>{
        return res.status(500).send({message: err.message});
    })
}