const { Model } = require('objection')
const knex = require('../../config/knex.config')
Model.knex(knex)

class Organizator extends Model {
  static get tableName () {
    return 'organizator'
  }

  static get relationMappings () {
    const PasswordReset = require('./passwordReset.model')

    return {
      passwordReset: {
        relation: Model.HasManyRelation,
        modelClass: PasswordReset,
        join: {
          from: 'passwordReset.nim',
          to: 'organizator.nim'
        }
      }
    }
  }
}

module.exports = Organizator
