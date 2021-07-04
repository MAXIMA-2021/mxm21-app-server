const mahasiswa = require('../models/mahasiswa.model');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.config');
const helper = require('../helpers/helper');

exports.signUp = async (req, res)=>{        
    const{nama, nim, no_hp, email, user_ig, id_line, tanggal_lahir, GoogleID} = req.body;
    
    try{
        const result = await mahasiswa.query().where('nim', nim);

        if(result.length !== 0) return res.status(409).send({message: "nim sudah terdaftar"});

        const insertResult = await mahasiswa.query().insert({
            nama,
            nim,
            no_hp,
            email,
            user_ig,
            id_line,
            tanggal_lahir,
            GoogleID
        });
        
        res.status(200).send({
            message: "Data berhasil ditambahkan",
            data: insertResult
        });
    }
    catch(err){
        res.status(500).send({message: err.message});
    }

}

exports.signIn = async (req, res) => {
    const { nim, password } = req.body;

    try{
        const dbMahasiswa = await mahasiswa.query().select('nim', 'tanggal_lahir').where('nim', nim);
        
        const password2 = helper.createPassword(dbMahasiswa);
    
        if(password !== password2){
            return res.status(400).send({message: 'Password is invalid'});
        }
    
        const token = jwt.sign({nim: dbMahasiswa[0].nim}, authConfig.jwt_key, {
            expiresIn: 86400 
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

