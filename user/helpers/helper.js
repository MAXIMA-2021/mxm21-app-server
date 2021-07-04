exports.createPassword = (dbMahasiswa)=>{
    //Change yyyy-mm-dd into dd-mm-yyyy
    let date = dbMahasiswa[0].tanggal_lahir;
    let dd = String(date.getDate()).padStart(2, '0');
    let mm = String(date.getMonth() + 1).padStart(2, '0'); 
    let yyyy = date.getFullYear();

    date = [];
    date.push(dd);
    date.push(mm);
    date.push(yyyy);

    const password2 = date.join('');

    return password2;
}