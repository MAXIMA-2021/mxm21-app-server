const { Model } = require('objection')
const knex = require('../../config/knex.config')
Model.knex(knex)

class Chapter_Dialogues extends Model {
  static get tableName () {
    return 'chapter_dialogues'
  }
}

module.exports = Chapter_Dialogues
