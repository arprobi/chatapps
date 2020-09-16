'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserTeamsSchema extends Schema {
  up () {
    this.create('user_teams', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('team_id').unsigned().references('id').inTable('teams')
      table.timestamps()
    })
  }

  down () {
    this.drop('user_teams')
  }
}

module.exports = UserTeamsSchema
