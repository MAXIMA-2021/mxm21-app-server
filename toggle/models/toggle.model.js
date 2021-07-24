const { Model } = require('objection')
const knex = require('../../config/knex.config')
Model.knex(knex)

class Technical_Toggle extends Model {
  static getTableName () {
    return 'technical_toggle'
  }
}

module.exports = Technical_Toggle
