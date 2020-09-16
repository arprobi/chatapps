'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TodosSchema extends Schema {
  up () {
    this.create('todos', (table) => {
      table.increments()
      table.string('name', 254).notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('parent_id').defaultTo(0)
      table.datetime('due_date', 6).nullable()
      table.boolean('is_done').default(0)
      table.string('type', 10).defaultTo('company') // company, markas, team, project
      table.integer('reference_id').defaultTo(0) // id from type
      table.timestamps()
    })
  }

  down () {
    this.drop('todos')
  }
}

module.exports = TodosSchema
