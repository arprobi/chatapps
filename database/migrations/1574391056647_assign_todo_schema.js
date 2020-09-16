'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AssignTodoSchema extends Schema {
  up () {
    this.create('assign_todos', (table) => {
      table.increments()
      table.integer('todo_id').unsigned().references('id').inTable('todos')
      table.string('position', 50)
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('status')
      table.timestamps()
    })
  }

  down () {
    this.drop('assign_todos')
  }
}

module.exports = AssignTodoSchema
