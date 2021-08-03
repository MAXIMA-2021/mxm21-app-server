const { Model } = require('objection')
const knex = require('../../config/knex.config')
Model.knex(knex)

class stateActivities extends Model {
  static get tableName () {
    return 'state_activities'
  }

  static get relationMappings () {
    const DayManagement = require('../models/dayManagement.model')

    return {
      dayManagement: {
        relation: Model.HasManyRelation,
        modelClass: DayManagement,
        join: {
          from: 'day_management.stateID',
          to: 'state_activities.stateID'
        }
      }
    }
  }
}

module.exports = stateActivities
