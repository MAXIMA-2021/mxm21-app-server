const { Model } = require('objection')
const knex = require('../../config/knex.config')
Model.knex(knex)

class DayManagement extends Model {
  static get tableName () {
    return 'day_management'
  }
}

module.exports = DayManagement
