const stateActivities = require('../models/stateActivities.model');
const stateRegistration = require('../models/stateRegistration.model');
const helper = require('../../helpers/helper');

exports.getRegistration = async (req, res)=>{
    const {stateID, nim} = req.query;

    let result = "";

    try{
        if(stateID === undefined && nim === undefined){
            result = await stateRegistration.query();
        }
        else if(stateID !== undefined){
            
            if(req.roleID === 2){
                result = await stateRegistration.query().where({stateID});
            }
            else{
                return res.status(403).send({
                    message: "Maaf selain panitia, tidak diperkenankan untuk mengaksesnya."
                })
            }

        }
        else if(nim !== undefined){
            result = await stateRegistration.query().where({nim});
        }
        else if(stateID !== undefined && nim !== undefined){
            
            if(req.roleID === 2){
                result = await stateRegistration.query().where({stateID, nim});
            }
            else{
                return res.status(403).send({
                    message: "Maaf selain panitia, tidak diperkenankan untuk mengaksesnya."
                })
            }

        }

        if(result.length === 0){
            return res.status(404).send({
                message: "Registratsi tidak dapat ditemukan"
            })
        }

        return res.status(200).send(result);
    }
    catch(err){
        return res.status(500).send({
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
            return res.status(404).send({message: "Anda tidak terdaftar1"});
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
            return res.status(404).send({message: "Peserta belum mendaftar"});
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
        const stateAttendanceDB = await stateRegistration.query()
        .select('state_activities.attendanceCode', 'state_registration.inEventAttendance')
        .where({
            'state_registration.stateID': stateID,
            'state_registration.nim': nim
        })
        .join(
            'state_activities', 
            'state_activities.stateID', 
            'state_registration.stateID'
        );

        if(stateAttendanceDB.length === 0)
            return res.status(404).send({
                message: "Anda belum mendaftar"
            });
        
        if(stateAttendanceDB[0].inEventAttendance === 0)
            return res.status(403).send({
                message: "Anda tidak mengikuti state hingga akhir"
            })

        if(attendanceCode === stateAttendanceDB[0].attendanceCode){
            const updateResult = await stateRegistration.query()
            .patch({exitAttendance})
            .where({stateID,nim});

            return res.status(200).send({message: "Proses Absensi Selesai"}); 
        }
        else{
            return res.status(406).send({message: "Kode presensi salah"});
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
        const checkRegistration = await stateRegistration.query()
        .where({nim, stateID});

        if(checkRegistration.length === 0)
            return res.status(404).send({
                message: "Anda belum mendaftar"
            });

        const deleteResult = await stateRegistration.query()
        .delete()
        .where({nim, stateID});
        
        const registeredState = await stateActivities.query().select('registered');

        const updateRegisteredState = await stateActivities.query()
        .where({stateID})
        .patch({
            registered: registeredState[0].registered - 1
        });
        
        return res.status(200).send({message: "Data Registrasi Berhasil Dihapus"});
    }
    catch(err){
        return res.status(500).send({message: err.message});
    }
}



