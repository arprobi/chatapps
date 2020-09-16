'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StatusSchema extends Schema {
  up () {
    this.create('statuses', (table) => {
      table.increments()
      table.string('message')
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('image')
      table.integer('company_id').unsigned().references('id').inTable('companies')
      table.integer('status').defaultTo(0)
      table.timestamps()
    })
  }

  down () {
    this.drop('statuses')
  }
}

module.exports = StatusSchema
