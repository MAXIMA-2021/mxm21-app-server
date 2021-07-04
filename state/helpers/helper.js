exports.createAttendanceTime = ()=>{
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); 
    let yyyy = today.getFullYear();
    let hour = today.getHours(); 
    let minute = today.getMinutes(); 
    let second = today.getSeconds(); 

    const attendanceTime = yyyy + '-' + mm + '-' + dd + ' ' + hour + ':' + minute + ':' + second;

    return attendanceTime;
}