const stateActivities = require('../models/stateActivities.model');

exports.getStateData = async (req, res)=>{
    const { nim, stateID} = req.query;

    try{
        
        const result = await stateActivities.query();
        return res.status(200).send(result);
    }
    catch(err){
        return res.status(400).send({message: err.message});
    }
}

exports.getStatebyParam = async (req, res)=>{
    const param = `%${req.params.param}%`;
 
    try{
        const result = await stateActivities.query()
        .where('stateID', 'like', param)
        .orWhere('name', 'like', param)

        if(result.length === 0){
            const result2 = await stateActivities.query()
            return res.status(200).send(result2);
        }

        return res.status(200).send(result);
    }
    catch(err){
        return res.status(400).send({message: err.message});
    }
}

exports.addState = async (req, res)=>{
    const {name, zoomLink, day, quota, attendanceCode} = req.body;

    const {stateLogo} = req.files;

    const uploadPath = './stateLogo/' + name + '_' + stateLogo.name;

    try{
        const insertResult = await stateActivities.query().insert({
            name,
            zoomLink,
            day,
            stateLogo: `${name}_${stateLogo.name}`,
            quota,
            registered: 0,
            attendanceCode
        });

        stateLogo.mv(uploadPath, (err)=>{
            if(err) return res.status(500).send({message: err.messsage});
        })

        return res.status(200).send({
            message: "Data berhasil ditambahkan",
            data: insertResult
        });
    }
    catch(err){
        return res.status(500).send({message: err.message});
    }
}

exports.updateState = async (req, res)=>{
    const stateID = req.params.stateID;

    const isProvide = await stateActivities.query().where('stateID', stateID);

    if(isProvide.length === 0) return res.status(400).send({message: "State tidak ditemukan"});

    const {name, zoomLink, day, quota, registered, attendanceCode} = req.body;
    const {stateLogo} = req.files;

    const uploadPath = './stateLogo/' + name + '_' + stateLogo.name;

    try{
        const insertResult = await stateActivities.query().where('stateID', stateID).patch({
            name,
            zoomLink,
            day,
            stateLogo: `${name}_${stateLogo.name}`,
            quota,
            registered,
            attendanceCode
        });

        stateLogo.mv(uploadPath, (err)=>{
            if(err) return res.status(500).send({message: err.messsage});
        })

        return res.status(200).send({
            message: "Data berhasil diupdate",
        });
    }
    catch(err){
        return res.status(500).send({message: err.message});
    }
}

exports.deleteState = async (req, res)=>{
    const stateID = req.params.stateID;

    const isProvide = await stateActivities.query().where('stateID', stateID);

    if(isProvide.length === 0) return res.status(400).send({message: "State tidak ditemukan"});

    try{
        const result = await stateActivities.query().delete().where('stateID', stateID) 
        return res.status(200).send({message: "Data State Berhasil Dihapus"});
    }
    catch(err){
        return res.status(400).send({message: err.message});
    }
}