const{Model} = require('objection');
const knex = require('../../config/knex.config');
Model.knex(knex);

class malpun extends Model{
    static get tableName(){
        return 'malpun_attendance';
    }
}

module.exports = malpun;