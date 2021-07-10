const{Model} = require('objection');
const knex = require('../../config/knex.config');
Model.knex(knex);

class stateActivities extends Model{
    static get tableName(){
        return 'state_activities';
    }
}

module.exports = stateActivities;