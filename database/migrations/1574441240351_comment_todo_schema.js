'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CommentTodoSchema extends Schema {
  up () {
    this.create('comment_todos', (table) => {
      table.increments()
      table.integer('todo_id').unsigned().references('id').inTable('todos')
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('comment', 250)
      table.integer('parent_id').defaultTo(0)
      table.integer('status').defaultTo(1)
      table.timestamps()
    })
  }

  down () {
    this.drop('comment_todos')
  }
}

module.exports = CommentTodoSchema
