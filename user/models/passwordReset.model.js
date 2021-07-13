const {Model} = require('objection');
const knex = require('../../config/knex.config');
Model.knex(knex);

class Password_Reset extends Model {
    static get tableName() {
        return 'password_reset';
    }
}

module.exports = Password_Reset;