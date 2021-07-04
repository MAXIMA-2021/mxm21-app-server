const stateActivities = require('../models/stateActivities.model');
const stateRegistration = require('../models/stateRegistration.model');
const helper = require('../helpers/helper');

exports.getRegistration = async (req, res)=>{
    const {stateID, nim} = req.query;

    let result = "";

    try{
        if(stateID === undefined && nim === undefined){
            result = await stateRegistration.query();
        }

        if(stateID !== undefined){
            if(req.roleID === 2){
                result = await stateRegistration.query().where({stateID});
            }
            else{
                result = {
                    message: "Maaf selain panitia tidak diperkenankan untuk mengaksesnya"
                }
            }
        }

        if(nim !== undefined){
            result = await stateRegistration.query().where({nim});
        }

        if(stateID !== undefined && nim !== undefined){
            if(req.roleID === 2){
                result = await stateRegistration.query().where({stateID});
            }
            else{
                result = {
                    message: "Maaf selain panitia tidak diperkenankan untuk mengaksesnya"
                }
            }
        }

        return res.status(200).send(result);
    }
    catch(err){
        return res.status(400).send({
            message: err.message
        });
    }
}

exports.addRegistration = async (req, res)=>{    
    const {stateID} = req.body;
    const {nim} = req.query;
    const queueNo = 0;
    const attendanceTime = 0;
    const inEventAttendance = 0; 
    const exitAttendance = 0;

    try{
        const insertResult = await stateRegistration.query()
        .insert({
            stateID,
            nim,
            queueNo,
            attendanceTime,
            inEventAttendance,
            exitAttendance
        });

        const dbActivities = await stateActivities.query().where('stateID', stateID);
        const updateRegisteredState = await stateActivities.query()
        .where('stateID', stateID)
        .patch({
            registered: dbActivities[0].registered + 1
        });

        return res.status(200).send({
            message: "Anda berhasil mendaftar",
            data: insertResult
        });
    }
    catch(err){
        return res.status(500).send({message: err.message});
    }
}

exports.attendanceState = async (req, res)=>{
    const {stateID} = req.params;
    const {nim} = req.query;
    const attendanceTime = helper.createAttendanceTime();
    const inEventAttendance = 1;

    try{
        const checkRegistration = await stateRegistration.query().where({
            stateID, 
            nim
        });

        if(checkRegistration.length === 0){
            return res.status(400).send({message: "Anda belum mendaftar"});
        }

        const updateResult = await stateRegistration.query()
        .where({stateID, nim})
        .patch({
            attendanceTime,
            inEventAttendance
        });
        
        return res.status(200).send({message: "Hadir"});
    }
    catch(err){
        return res.status(500).send({
            message: err.message
        });
    }
}

exports.updateAttendance = async (req, res)=>{
    const {stateID, nim} = req.params;
    let {inEventAttendance} = req.body;
        
    try{
        const checkRegistration = await stateRegistration.query().where({
            stateID, 
            nim
        });

        if(checkRegistration.length === 0){
            return res.status(400).send({message: "Peserta belum mendaftar"});
        }

        const updateAttendance = await stateRegistration.query().where({
            stateID,
            nim
        })
        .patch({
            inEventAttendance: inEventAttendance
        })

        return res.status(200).send({message: "Sudah diupdate"});
    }
    catch(err){
        return res.status(500).send({
            message: err.message
        });
    }
}

exports.verifyAttendanceCode = async (req, res) => {
    const {stateID} = req.params;
    const {nim} = req.query;
    const {attendanceCode} = req.body;
    const exitAttendance = 1;

    try{
        const stateAttendanceCode = await stateActivities.query()
        .select('attendanceCode')
        .where('stateID', stateID);
        
        if(attendanceCode === stateAttendanceCode[0].attendanceCode){
            const updateResult = await stateRegistration.query()
            .patch({exitAttendance})
            .where({stateID,nim});

            return res.status(200).send({message: "Anda Sudah Absen"});
        }
        else{
            return res.status(500).send({message: "Kode presensi salah"});
        }

    }
    catch(err){
        return res.status(500).send({message: err.message});
    }
}

exports.deleteRegistration = async (req, res)=>{
    const {stateID} = req.params;
    const {nim} = req.query;
    
    try{
        const deleteResult = await stateRegistration.query()
        .delete()
        .where({nim, stateID});
        
        const registeredState = await stateActivities.query().select('registered');

        const updateRegisteredState = await stateActivities.query()
        .where('stateID', stateID)
        .patch({
            registered: registeredState[0].registered - 1
        });
        
        return res.status(200).send({message: "Data Registrasi Berhasil Dihapus"});
    }
    catch(err){
        return res.status(400).send({message: err.message});
    }
}



