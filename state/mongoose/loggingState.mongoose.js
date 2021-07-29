const StateLogging = require('../models/stateLogging.model')

exports.logging = async (type, nim, data, date_time) => {
  try {
    const logging = new StateLogging({
      type: type,
      nim: nim,
      data: data,
      date_time: date_time
    })

    await logging.save()
  } catch (err) {
    console.log(err)
  }
}
