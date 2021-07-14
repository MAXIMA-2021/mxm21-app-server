const {Model} = require('objection');
const knex = require('../../config/knex.config');
Model.knex(knex);

class Divisi extends Model {
    static get tableName() {
        return 'divisi';
    }
}

module.exports = Divisi;