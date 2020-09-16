'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class FilesSchema extends Schema {
  up () {
    this.create('files', (table) => {
      table.increments()
      table.string('name')
      table.string('title').nullable()
      table.string('description').nullable()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('reference_id').defaultTo(0)
      table.string('type', 10).defaultTo('company')
      table.string('extension')
      table.timestamps()
    })
  }

  down () {
    this.drop('files')
  }
}

module.exports = FilesSchema
