'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class FileCommentsSchema extends Schema {
  up () {
    this.create('file_comments', (table) => {
      table.increments()
      table.text('message')
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('file_id').unsigned().references('id').inTable('files')
      table.integer('parent_id').defaultTo(0)
      table.timestamps()
    })
  }

  down () {
    this.drop('file_comments')
  }
}

module.exports = FileCommentsSchema
