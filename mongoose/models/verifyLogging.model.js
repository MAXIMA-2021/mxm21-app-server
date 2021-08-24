const mongoose = require('mongoose')

const mxm21Verification = mongoose.Schema({
  type: String,
  verifying: String,
  isVerified: String,
  verify: String,
  time: String
})

const verifactionLogging = mongoose.model('mxm21-acc-verification-logging', mxm21Verification)
module.exports = verifactionLogging
