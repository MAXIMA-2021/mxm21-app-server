const {Model} = require('objection');
const knex = require('../../config/knex.config');
Model.knex(knex);

class Panitia extends Model {
    static get tableName() {
        return 'panitia';
    }
}

module.exports = Panitia;