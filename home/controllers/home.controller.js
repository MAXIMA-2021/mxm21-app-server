const homeInformation = require('../models/homeInformation.model');
const homeMedia = require('../models/homeMedia.model');
const panitia = require('../../user/models/panitia.model');
const helper = require('../../helpers/helper');
const fs = require('fs');

//Configure Google Cloud Storage
const {Storage} = require('@google-cloud/storage');
const storage = new Storage({
    keyFilename: './keys/maxima-umn-2021-bucket-playground-key.json'
});

exports.getHomeData = async (req, res) =>{
    const{organizator} = req.query;

    if(organizator === undefined){
        const dbHomeAll = await homeInformation.query();

        for(let i = 0; i < dbHomeAll.length; i++){
            const dbHomeMediaAll = await homeMedia.query()
            .select('photoID', 'linkMedia')
            .where({homeID: dbHomeAll[i].homeID});

            dbHomeAll[i].home_media = dbHomeMediaAll;
        }

        return res.status(200).send(dbHomeAll)   
    }
    else{
        const dbHome = await homeInformation.query().where({search_key: organizator});
        
        if(dbHome.length === 0)
            return res.status(404).send({
                message: "Home tidak tersedia"
            })

        const dbHomeMedia = await homeMedia.query()
        .select('photoID', 'linkMedia')
        .where({homeID: dbHome[0].homeID});

        dbHome[0].home_media = dbHomeMedia;
        
        return res.status(200).send(dbHome);
    }
}

exports.createHome = async (req, res)=>{
    const acceptedDivision = ["D01", "D02", "D03"];

    const nim = req.nim;

    const{
        name,
        kategori,
        shortDesc,
        longDesc,
        linkYoutube,
        lineID,
        instagram,
    } = req.body;

    if(name.match(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi)){
        return res.status(400).send({
            message: `Nama diharapkan tidak terdapat unsur _ \ / : * ? " ' < > |`
        })
    }

    const fixName = helper.toTitleCase(name);

    const searchKey = name.toLowerCase().replace(" ", "-");

    const {linkLogo} = req.files;
    
    let {linkMedia} = req.files;

    const dateFile = (helper.createAttendanceTime().split(' ')[0].split('-').join(''));
    const timeFile = (helper.createAttendanceTime().split(' ')[1].split(':').join(''));

    const bucketName = "mxm21-bucket-playground";

    //format file logo
    const logoFileName = `${name}_${dateFile.concat(timeFile)}_${linkLogo.name}`;

    const logoUploadPath = `./homeLogo/${logoFileName}`;
  
    const logoUrlFile = `https://storage.googleapis.com/${bucketName}/${logoFileName}`

    //format file media
    const mediaFileName = [];
    const mediaUploadPath = [];
    const mediaUrlFile = [];

    if(linkMedia !== undefined){
        if(linkMedia.length === undefined){
            linkMedia = [linkMedia];
        }

        for(let i = 0; i < linkMedia.length; i++){
            mediaFileName.push(linkMedia[i].name);
            mediaUploadPath.push(`./homeMedia/${mediaFileName[i]}`);
            mediaUrlFile.push(`https://storage.googleapis.com/${bucketName}/${mediaFileName[i]}`);
        }
    }

    try{
        const checkNim = await panitia.query().where({nim});

        if(!acceptedDivision.includes(checkNim[0].divisiID))
            return res.status(403).send({
                message: "Maaf divisi anda tidak diizinkan unuk mengaksesnya"
            })

        const checkSearchKey = await homeInformation.query().where({search_key: searchKey});

        if(checkSearchKey.length !== 0)
            return res.status(409).send({
                message: "Nama ini telah terdaftar sebelumnya."
            })

        const insertHomeInformation = await homeInformation.query().insert({
            search_key: searchKey,
            linkLogo: logoUrlFile,
            name: fixName,
            kategori,
            shortDesc,
            longDesc,
            instagram,
            lineID,
            linkYoutube
        });

        linkLogo.mv(logoUploadPath, (err)=>{
            if(err)
                return res.status(500).send({
                    message: err.message
                })
        })

        res_bucket = await storage.bucket(bucketName).upload(logoUploadPath);

        fs.unlink(logoUploadPath, (err)=>{
            if(err)
                return res.status(500).send({
                    message: err.message
                })
        })

        if(mediaUploadPath.length !== 0){
            const dbHomeID = await homeInformation.query()
            .select('homeID')
            .where({search_key: searchKey})
        
            for(let i = 0; i < linkMedia.length; i++){
                const insertHomeMedia = await homeMedia.query().insert({
                    homeID: dbHomeID[0].homeID,
                    linkMedia: mediaUrlFile[i]
                })
    
                linkMedia[i].mv(mediaUploadPath[i], (err)=>{
                    if(err)
                        return res.status(500).send({
                            message: err.message
                        })
                })
    
                res_bucket = await storage.bucket(bucketName).upload(mediaUploadPath[i]);
    
                fs.unlink(mediaUploadPath[i], (err)=>{
                    if(err)
                        return res.status(500).send({
                            message: err.message
                        })
                })
            }
        }

        return res.status(200).send({
            message: "Home berhasil terdaftar"
        });
    }
    catch(err){
        return res.status(500).send({
            message: err.message
        })
    }
}

exports.updateHome = async (req,res)=>{
    const acceptedDivision = ["D01", "D02", "D03"];

    const nim = req.nim;

    const{
        name,
        kategori,
        shortDesc,
        longDesc,
        linkYoutube,
        lineID,
        instagram,
        photoID
    } = req.body;

    const {homeID} = req.params;
    
    if(name.match(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi)){
        return res.status(400).send({
            message: `Nama diharapkan tidak terdapat unsur \ / : * ? " ' < > |`
        })
    }

    const searchKey = name.toLowerCase().replace(" ", "-");

    let linkLogo = null;
    let linkMedia = null;
    let dateFile = '';
    let timeFile = '';
    let logoFileName = '';
    let logoUploadPath = '';
    let logoUrlFile = '';

    const bucketName = "mxm21-bucket-playground";

    if(req.files){
        linkLogo = req.files.linkLogo;

        dateFile = (helper.createAttendanceTime().split(' ')[0].split('-').join(''));
        timeFile = (helper.createAttendanceTime().split(' ')[1].split(':').join(''));

        logoFileName = `${name}_${dateFile.concat(timeFile)}_${linkLogo.name}`;

        logoUploadPath = `./homeLogo/${logoFileName}`;

        logoUrlFile = `https://storage.googleapis.com/${bucketName}/${logoFileName}`
    }

    try{
        const checkNim = await panitia.query().where({nim});

        if(!acceptedDivision.includes(checkNim[0].divisiID))
            return res.status(403).send({
                message: "Maaf divisi anda tidak diizinkan unuk mengaksesnya"
            })

        const dbHome1 = await homeInformation.query().where({homeID});

        const dbHome2 = await homeInformation.query().where({search_key: searchKey});
    
        if(dbHome2.length !== 0){
            if(dbHome1[0].search_key !== dbHome2[0].search_key){
                return res.status(409).send({
                    message: "Nama ini telah terdaftar sebelumnya."
                })
            }
        }   
        
        if(logoUploadPath){
            const updateHomeInformation = await homeInformation.query()
            .where({homeID})
            .patch({
                search_key: searchKey,
                linkLogo: logoUrlFile,
                name,
                kategori,
                shortDesc,
                longDesc,
                instagram,
                lineID,
                linkYoutube
            });
    
            linkLogo.mv(logoUploadPath, (err)=>{
                if(err)
                    return res.status(500).send({
                        message: err.message
                    })
            })
    
            res_bucket = await storage.bucket(bucketName).upload(logoUploadPath);
    
            fs.unlink(logoUploadPath, (err)=>{
                if(err)
                    return res.status(500).send({
                        message: err.message
                    })
            })
        }
        else{
            const updateHomeInformation = await homeInformation.query()
            .where({homeID})
            .patch({
                search_key: searchKey,
                name,
                kategori,
                shortDesc,
                longDesc,
                instagram,
                lineID,
                linkYoutube
            });
        }

        return res.status(200).send({
            message: "Home berhasil diupdate"
        })
    }
    catch(err){
        return res.status(500).send({
            message: err.message
        })
    }
}

exports.updateLinkMedia = async(req, res) => {
    const acceptedDivision = ["D01", "D02", "D03"];

    const nim = req.nim;

    const {photoID} = req.params;

    try{
        const checkNim = await panitia.query().where({nim});

        if(!acceptedDivision.includes(checkNim[0].divisiID))
            return res.status(403).send({
                message: "Maaf divisi anda tidak diizinkan unuk mengaksesnya"
            })

        const dbMedia = await homeMedia.query().where({photoID});

        const dbHome = await homeInformation.query().where({homeID : dbMedia[0].homeID});

        const bucketName = "mxm21-bucket-playground";

        if(dbMedia.length === 0){
            return res.status(404).send({
                message: "Foto tidak dapat ditemukan"
            })
        }

        if(req.files){
            const linkMedia = req.files.linkMedia;
    
            const dateFile = (helper.createAttendanceTime().split(' ')[0].split('-').join(''));
            const timeFile = (helper.createAttendanceTime().split(' ')[1].split(':').join(''));
    
            const mediaFileName = `${dbHome[0].name}_${dateFile.concat(timeFile)}_${linkMedia.name}`;
    
            const mediaUploadPath = `./homeMedia/${mediaFileName}`;

            const mediaUrlFile = `https://storage.googleapis.com/${bucketName}/${mediaFileName}`

            if(mediaUploadPath){
                const updateHomeMedia = await homeMedia.query()
                .where({photoID})
                .patch({
                    linkMedia : mediaUrlFile
                });
    
                linkMedia.mv(mediaUploadPath, (err)=>{
                    if(err)
                        return res.status(500).send({
                            message: err.message
                        })
                })
        
                res_bucket = await storage.bucket(bucketName).upload(mediaUploadPath);
        
                fs.unlink(mediaUploadPath, (err)=>{
                    if(err)
                        return res.status(500).send({
                            message: err.message
                        })
                })
            }
        }
        return res.status(200).send({
            message: "HomeMedia berhasil diupdate"
        })
    }
    catch(err){
        return res.status(500).send({
            message: err.message
        })
    }
}

exports.deleteHome = async (req,res)=>{
    const acceptedDivision = ["D01", "D02"];

    const nim = req.nim

    const {homeID} = req.params;

    try{
        const checkNim = await panitia.query().where({nim});

        if(!acceptedDivision.includes(checkNim[0].divisiID))
            return res.status(403).send({
                message: "Maaf divisi anda tidak diizinkan unuk mengaksesnya"
            })

        const isProvide = await homeInformation.query().where('homeID', homeID);

        if(isProvide.length === 0) 
            return res.status(404).send({message: "Home tidak ditemukan"});

        const deleteMedia = await homeMedia.query().delete().where({homeID});
        const deleteHome = await homeInformation.query().delete().where({homeID});
        
        return res.status(200).send({message: "Data Home berhasil dihapus"});
    }
    catch(err){
        return res.status(500).send({message: err.message});
    }
}