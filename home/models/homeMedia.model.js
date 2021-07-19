const { Model } = require('objection')
const knex = require('../../config/knex.config')
Model.knex(knex)

class Home_Media extends Model {
  static get tableName () {
    return 'home_media'
  }

  static get relationMappings () {
    const homeInformation = require('./homeInformation.model')

    return {
      home_information: {
        relation: Model.HasManyRelation,
        modelClass: homeInformation,
        join: {
          from: 'home_information.homeID',
          to: 'home_media.homeID'
        }
      }
    }
  }
}

module.exports = Home_Media
