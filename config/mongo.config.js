const mongoose = require('mongoose')

module.exports = () => {
  mongoose.connect(`${process.env.DB_MONGO}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, () => {
    console.log('connect to DB')
  })
}
