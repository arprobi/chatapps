'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CompanySchema extends Schema {
  up () {
    this.create('companies', (table) => {
      table.increments()
      table.string('name', 100).notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.text('logo').nullable()
      table.text('description').nullable()
      table.integer('status').defaultTo(0)
      table.timestamps()
    })
  }

  down () {
    this.drop('companies')
  }
}

module.exports = CompanySchema
