require('dotenv/config')
const express = require('express')
const cors = require('cors')
const file = require('express-fileupload')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(file())

// Configure Mongo DB
require('./config/mongo.config')()

require('./user/routes/mahasiswa.route')(app)
require('./user/routes/panitia.route')(app)
require('./user/routes/organizator.route')(app)
require('./home/routes/home.route')(app)
require('./state/routes/stateActivities.route')(app)
require('./state/routes/stateRegistration.route')(app)
require('./malpun/routes/malpun.route')(app)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Listening to the server ${PORT}`)
})
