const{Model} = require('objection');
const knex = require('../../config/knex.config');
Model.knex(knex);

class stateRegistration extends Model{
    static get tableName(){
        return 'state_registration';
    }

    static get relationMappings(){
        const Mahasiswa = require('../../user/models/mahasiswa.model');
        const StateActivities = require('./stateActivities.model');

        return{
            mahasiswa:{
                relation: Model.HasManyRelation,
                modelClass: Mahasiswa,
                join:{
                    from: 'mahasiswa.nim',
                    to: 'state_registration.nim'
                }
            },

            stateActivities:{
                relation: Model.HasManyRelation,
                modelClass: StateActivities,
                join:{
                    from: 'state_activities.stateID',
                    to: 'state_registration.stateID'
                }
            }
        }
    }
}

module.exports = stateRegistration;