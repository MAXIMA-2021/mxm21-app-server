const organizator = require('../models/organizator.model');
const stateActivities = require('../../state/models/stateActivities.model');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.config');
const helper = require('../../helpers/helper');
const bcrypt = require('bcryptjs');


exports.signUp = async (req, res) => {
    const{ 
        nim, 
        name, 
        email, 
        password, 
        stateID, 
    } = req.body;

    const verified = 0;
        
    const fixName = helper.toTitleCase(name);

    try{
        const result = await organizator.query().where('nim', nim);

        if(result.length !== 0) 
            return res.status(409).send({message: "nim sudah terdaftar"});

        const checkState = await stateActivities.query().where('stateID', stateID)

        if(checkState.length === 0)
            return res.status(404).send({message: "State tidak terdaftar"});
        
        const fixPassword = bcrypt.hashSync(password, 8);

        const insertResult = await organizator.query().insert({
            nim,
            name: fixName,
            email,
            password: fixPassword,
            stateID, 
            verified
        });

        res.status(200).send({
            message: "Data berhasil ditambahkan"
        });
    }
    catch(err){
        res.status(500).send({message: err.message});
    }
}

exports.signIn = async (req, res) => {
    const { nim, password } = req.body;

    try{
        const dbOrganizator = await organizator.query().where('nim', nim);

        if(dbOrganizator.length === 0)
            return res.status(404).send({message: "nim tidak terdaftar"});

        if(dbOrganizator[0].verified === 0)
            return res.status(401).send({message: "Maaf akun anda belum diverifikasi oleh pihak pusat"});

        const isPasswordValid = bcrypt.compareSync(password, dbOrganizator[0].password);

        if(!isPasswordValid)
            return res.status(401).send({message: "Password Invalid"});

        const token = jwt.sign({nim: dbOrganizator[0].nim, stateID: dbOrganizator[0].stateID}, authConfig.jwt_key, {
            expiresIn: 21600  
        });
    
        res.status(200).send({
            message: "Berhasil Login",
            token: token
        });
    }
    catch(err){
        res.status(500).send({message: err.message});
    }
}