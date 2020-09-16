'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TeamSchema extends Schema {
  up () {
    this.create('teams', (table) => {
      table.increments()
      table.string('name', 100).notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('company_id').unsigned().references('id').inTable('companies')
      table.text('description').nullable()
      table.integer('status').defaultTo(0)
      table.timestamps()
    })
  }

  down () {
    this.drop('teams')
  }
}

module.exports = TeamSchema
