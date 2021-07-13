const {Model} = require('objection');
const knex = require('../../config/knex.config');
Model.knex(knex);

class Home_Information extends Model {
    static get tableName() {
        return 'home_information';
    }
}

module.exports = Home_Information;