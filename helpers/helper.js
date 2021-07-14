exports.createPassword = (dbMahasiswa)=>{
    //Change yyyy-mm-dd into dd-mm-yyyy
    let date = dbMahasiswa[0].tanggalLahir;
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); 
    const yyyy = date.getFullYear();

    date = [];
    date.push(dd);
    date.push(mm);
    date.push(yyyy);

    const password2 = date.join('');

    return password2;
}

exports.createAttendanceTime = ()=>{
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); 
    const yyyy = today.getFullYear();
    const hour = today.getHours(); 
    const minute = today.getMinutes(); 
    const second = today.getSeconds(); 

    const attendanceTime = `${yyyy}-${mm}-${dd} ${hour}:${minute}:${second}`;

    return attendanceTime;
}

exports.toTitleCase = (name)=>{
    return name.replace(
        /\w\S*/g, (txt)=>{
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    )
}