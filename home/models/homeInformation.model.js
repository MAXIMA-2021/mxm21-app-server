const { Model } = require('objection')
const knex = require('../../config/knex.config')
Model.knex(knex)

class Home_Information extends Model {
  static get tableName () {
    return 'home_information'
  }

  static get relationMappings () {
    const chapterDialogues = require('../../chapters/models/chapters.model')

    return {
      chapterDialogues: {
        relation: Model.HasManyRelation,
        modelClass: chapterDialogues,
        join: {
          from: 'home_information.kategori',
          to: 'chapter_dialogues.homeChapterID'
        }
      }
    }
  }
}

module.exports = Home_Information
