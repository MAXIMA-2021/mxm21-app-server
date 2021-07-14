const stateActivities = require('../models/stateActivities.model');
const panitia = require('../../user/models/panitia.model');
const fs = require('fs');
const helper = require('../../helpers/helper');

//Google Cloud Storage Library and Keys
const {Storage} = require('@google-cloud/storage');
const storage = new Storage({
    keyFilename: './keys/maxima-umn-2021-bucket-playground-key.json'
});

exports.getStateData = async (req, res)=>{
    const param = req.query.param; 

    try{
        if(param === undefined){
            result = await stateActivities.query();
            return res.status(200).send(result);
        }
        else{
            result = await stateActivities.query()
            .where('stateID', param)
            .orWhere('name', param)

            if(result.length === 0){
                return res.status(404).send({
                    message: "State Tidak Ditemukan"
                })
            }

            else{
                return res.status(200).send(result)
            }
        }
    }
    catch(err){
        return res.status(500).send({message: err.message});
    }
}

exports.addState = async (req, res)=>{
    const nim = req.nim;
    
    const checkDivisi = await panitia.query().where({nim});

    const acceptedDivisi = ["D01", "D02", "D03"];

    if(!acceptedDivisi.includes(checkDivisi[0].divisiID))
        return res.status(403).send({
            message: "Maaf divisi anda tidak diizinkan untuk mengaksesnya"
        });

    const {name, zoomLink, day, quota, attendanceCode} = req.body;
    const {stateLogo} = req.files;

    const dateFile = (helper.createAttendanceTime().split(' ')[0].split('-').join(''))
    const timeFile = (helper.createAttendanceTime().split(' ')[1].split(':').join(''))
       
    //format filename = nama state + nama file + datetime upload file
    const fileName = name + "_" + dateFile.concat(timeFile) + "_" +  stateLogo.name;
   
    const uploadPath = './stateLogo/' + fileName;

    const bucket_name = "mxm21-bucket-playground";

    const url_file = `https://storage.googleapis.com/${bucket_name}/${fileName}`;

    try{
        const insertResult = await stateActivities.query().insert({
            name, 
            zoomLink,
            day,
            stateLogo: url_file,
            quota,
            registered: 0, 
            attendanceCode
        });

        stateLogo.mv(uploadPath, (err)=>{
            if(err) return res.status(500).send({message: err.messsage});
        })

        res_bucket = await storage.bucket(bucket_name).upload(uploadPath);
        
        res.status(200).send({
            message: "Data berhasil ditambahkan" 
        });

        fs.unlink(uploadPath, (err)=>{
            if(err) return res.status(500).send({message: err.messsage});
        })
    }
    catch(err){
        return res.status(500).send({message: err.message});
    }
}

exports.updateState = async (req, res)=>{
    const nim = req.nim;
    
    const checkDivisi = await panitia.query().where({nim});

    const acceptedDivisi = ["D01", "D02", "D03"];

    if(!acceptedDivisi.includes(checkDivisi[0].divisiID))
        return res.status(403).send({
            message: "Maaf divisi anda tidak diizinkan untuk mengaksesnya"
        });

    const stateID = req.params.stateID;

    const isProvide = await stateActivities.query().where('stateID', stateID);

    if(isProvide.length === 0) return res.status(404).send({message: "State tidak ditemukan"});

    const {name, zoomLink, day, quota, registered, attendanceCode} = req.body;
    
    let stateLogo = null;
    let dateFile = '';
    let timeFile = '';
    let fileName = '';
    let uploadPath = '';
    let bucket_name = '';
    let url_file = '';
    
    if(req.files){
        stateLogo = req.files.stateLogo;   
        dateFile = (helper.createAttendanceTime().split(' ')[0].split('-').join(''));
        timeFile = (helper.createAttendanceTime().split(' ')[1].split(':').join(''));

        fileName = name + "_" + dateFile.concat(timeFile) + "_" +  stateLogo.name;

        uploadPath = './stateLogo/' + fileName;

        bucket_name = "mxm21-bucket-playground";

        url_file = `https://storage.googleapis.com/${bucket_name}/${fileName}`;
    } 

    try{
        if(uploadPath){
        
            const insertResult = await stateActivities.query().where('stateID', stateID).patch({
                name,
                zoomLink,
                day,
                stateLogo: url_file,
                quota,
                registered,
                attendanceCode
            });

            stateLogo.mv(uploadPath, (err)=>{
                if(err) return res.status(500).send({message: err.messsage});
            })

            res_bucket = await storage.bucket(bucket_name).upload(uploadPath);

            fs.unlink(uploadPath, (err)=>{
                if(err) return res.status(500).send({message: err.message});
            })
        }
        else{
            const insertResult = await stateActivities.query().where('stateID', stateID).patch({
                name,
                zoomLink,
                day,
                quota,
                registered,
                attendanceCode
            });
        }
        return res.status(200).send({
            message: "Data berhasil diupdate",
        });
    }
    catch(err){
        return res.status(500).send({message: err.message});
    }
} 

exports.deleteState = async (req, res)=>{
    const acceptedDivisi = ["D01", "D02"];

    if(!acceptedDivisi.includes(checkDivisi[0].divisiID))
        return res.status(403).send({
            message: "Maaf divisi anda tidak diizinkan untuk mengaksesnya"
        });

    const stateID = req.params.stateID;

    const isProvide = await stateActivities.query().where('stateID', stateID);

    if(isProvide.length === 0) return res.status(404).send({message: "State tidak ditemukan"});

    try{
        const result = await stateActivities.query().delete().where('stateID', stateID) 
        return res.status(200).send({message: "Data State Berhasil Dihapus"});
    }
    catch(err){
        return res.status(500).send({message: err.message});
    }
}