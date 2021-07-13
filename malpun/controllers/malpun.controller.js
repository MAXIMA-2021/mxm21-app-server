const malpun = require('../models/malpun.model');
const mahasiswa = require('../../user/models/mahasiswa.model');
const panitia = require('../../user/models/panitia.model');

exports.getMalpunData = async (req, res) => {
    const nim = req.nim;

    const acceptedDivision = ["D01", "D02", "D03", "D04"];

    try{
        const checkNim = await panitia.query().where({nim});

        if(!acceptedDivision.includes(checkNim[0].divisiID))
            return res.status(403).send({
                message: "Maaf divisi anda tidak diizinkan unuk mengaksesnya"
            })

        const result = await malpun.query();

        return res.status(200).send(result);
    }
    catch(err){
        return res.status(500).send({message: err.message});
    }
}

exports.registerMalpun = async (req, res)=>{
    const {nim} = req.query;

    try{
        const dbMahasiswa = await mahasiswa.query().where({nim});

        const checkResult = await malpun.query().where({
            email: dbMahasiswa[0].email
        });

        if(checkResult.length !== 0) 
            return res.status(409).send({
                message: "Maaf nama anda sudah terdaftar sebelumnya"
            });

        const insertMalpun = await malpun.query().insert({
            email: dbMahasiswa[0].email,
            name: dbMahasiswa[0].nama,
            phoneNumber: dbMahasiswa[0].no_hp
        });

        return res.status(200).send({
            message: "Anda berhasil mendaftar"
        });
    }
    catch(err){
        return res.status(500).send({
            message: err.message
        });
    }
    
}