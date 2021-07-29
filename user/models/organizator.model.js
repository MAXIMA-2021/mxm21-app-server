const { Model } = require('objection')
const knex = require('../../config/knex.config')
Model.knex(knex)

class Organizator extends Model {
  static get tableName () {
    return 'organizator'
  }
}

module.exports = Organizator
