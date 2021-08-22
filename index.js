require('dotenv/config')
const path = require('path')
const express = require('express')
const cors = require('cors')
const file = require('express-fileupload')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(file())

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/pages/index.html'))
})
app.use(express.static('pages'))
app.get('/is_run', (req, res) => {
  res.status(200).send({ server: process.env.SERVER_NO, zone: process.env.SERVER_ZONE })
})

// Configure Mongo DB
require('./config/mongo.config')()

require('./user/routes/mahasiswa.route')(app)
require('./user/routes/panitia.route')(app)
require('./user/routes/organizator.route')(app)
require('./user/routes/main.route')(app)
require('./home/routes/home.route')(app)
require('./state/routes/stateActivities.route')(app)
require('./state/routes/stateRegistration.route')(app)
require('./malpun/routes/malpun.route')(app)
require('./toggle/routes/toggle.route')(app)
require('./passwordReset/routes/passwordReset.route')(app)
require('./chapters/routes/chapters.route')(app)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Listening to the server ${PORT}`)
})
