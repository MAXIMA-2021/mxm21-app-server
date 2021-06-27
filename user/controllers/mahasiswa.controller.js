const mahasiswa = require('../models/mahasiswa.model');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.config');

exports.signUp = (req, res)=>{        
    const{nama, nim, no_hp, email, user_ig, id_line, tanggal_lahir, GoogleID} = req.body;
    
    mahasiswa.query().where('nim', nim).then(result=>{
        if(result.length !== 0) return res.status(409).send({message: "nim sudah terdaftar"});
        mahasiswa.query().insert({
            nama: nama,
            nim: nim,
            no_hp: no_hp,
            email: email,
            user_ig: user_ig,
            id_line: id_line,
            tanggal_lahir: tanggal_lahir,
            GoogleID: GoogleID
        })
        .then(result=>{
            res.status(200).send({
                message: "Data berhasil ditambahkan",
                data: result
            });
        })
        .catch(err=>{
            res.status(500).send({
                message: err.message
            });
        });
    })
}

exports.signIn = (req, res) => {
    const { nim, tanggal_lahir } = req.body;
    const password = tanggal_lahir;

    mahasiswa.query().select('nim', 'tanggal_lahir').where('nim', nim)
    .then(result=>{
        result = result[0];
        
        //Change yyyy-mm-dd into dd-mm-yyyy
        let date = result.tanggal_lahir;
        let dd = String(date.getDate()).padStart(2, '0');
        let mm = String(date.getMonth() + 1).padStart(2, '0'); 
        let yyyy = date.getFullYear();
        
        date = [];
        date.push(dd);
        date.push(mm);
        date.push(yyyy);

        const password2 = date.join('');
        
        if(password !== password2){
            return res.status(400).send({message: 'Password is invalid'});
        }

        const token = jwt.sign({nim: result.nim}, authConfig.jwt_key, {
            expiresIn: 86400 
        });

        res.status(200).send({
            message: "Berhasil Login",
            token: token
        })
    })
    .catch(err=>{
        res.status(500).send({message: err.message});
    })
}

