exports.createPassword = (dbMahasiswa) => {
  // Change yyyy-mm-dd into dd-mm-yyyy
  let date = dbMahasiswa[0].tanggalLahir
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()

  date = []
  date.push(dd)
  date.push(mm)
  date.push(yyyy)

  const password2 = date.join('')

  return password2
}

exports.createAttendanceTime = () => {
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy = today.getFullYear()
  const hour = `${today.getHours()}`.padStart(2, '0')
  const minute = `${today.getMinutes()}`.padStart(2, '0')
  const second = `${today.getSeconds()}`.padStart(2, '0')

  const attendanceTime = `${yyyy}-${mm}-${dd} ${hour}:${minute}:${second}`

  return attendanceTime
}

exports.createDateNumber = (date) => {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()

  return `${yyyy}-${mm}-${dd}`
}

exports.createDate = (date) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }

  return date.toLocaleDateString('in-IN', options)
}

exports.createTime = (date) => {
  const hour = `${date.getHours()}`.padStart(2, '0')
  const minute = `${date.getMinutes()}`.padStart(2, '0')

  return `${hour}:${minute}`
}

exports.toTitleCase = (name) => {
  return name.replace(
    /\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    }
  )
}

exports.createAttendanceCode = (name) => {
  const randomNumber = Math.floor(Math.random() * (999 - 100 + 1) + 100)

  const code = name.split(' ').join('').slice(0, 3)

  const attendanceCode = `${code}${randomNumber}`

  return attendanceCode
}

exports.createOTP = () => {
  let result = ''

  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

  for (let i = 6; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }

  return result
}

exports.createUpdatedObject = (object1, object2) => {
  const fixObject = {}

  const keys = Object.keys(object2)

  for (let i = 0; i < keys.length; i++) {
    if (object1[keys[i]] !== object2[keys[i]]) {
      fixObject[keys[i]] = object2[keys[i]]
    }
  }

  return fixObject
}

exports.createStatusState = (dateNow, dateOpen, dateState) => {
  const dNow = this.createDateNumber(dateNow).split('-').join('/')
  const dOpen = this.createDateNumber(dateOpen).split('-').join('/')
  const dState = this.createDateNumber(dateState).split('-').join('/')

  const tNow = this.createTime(dateNow)
  const tOpen = this.createTime(dateOpen)
  const tState = this.createTime(dateState)

  let status

  switch (true) {
    case Date.parse(`${dNow} ${tNow}`) < Date.parse(`${dOpen} ${tOpen}`) :
      status = 'prepare'
      break
    case Date.parse(`${dNow} ${tNow}`) >= Date.parse(`${dOpen} ${tOpen}`) &&
         Date.parse(`${dNow} ${tNow}`) < Date.parse(`${dState} ${tState}`) :
      status = 'ready'
      break
    case Date.parse(`${dNow} ${tNow}`) >= Date.parse(`${dState} ${tState}`) &&
         Date.parse(`${dNow} ${tNow}`) < Date.parse(`${dState} 22:00`):
      status = 'open'
      break
    case Date.parse(`${dNow} ${tNow}`) >= Date.parse(`${dState} 22:00`) :
      status = 'close'
      break
  }

  return status
}
