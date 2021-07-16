const { Model } = require('objection')
const knex = require('../../config/knex.config')
Model.knex(knex)

class Panitia extends Model {
  static get tableName () {
    return 'panitia'
  }

  static get relationMappings () {
    const PasswordReset = require('./passwordReset.model')

    return {
      passwordReset: {
        relation: Model.HasManyRelation,
        modelClass: PasswordReset,
        join: {
          from: 'passwordReset.nim',
          to: 'panitia.nim'
        }
      }
    }
  }
}

module.exports = Panitia
