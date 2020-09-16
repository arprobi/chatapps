'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MarkasSchema extends Schema {
  up () {
    this.create('markas', (table) => {
      table.increments()
      table.string('name', 100).defaultTo('Markas')
      table.integer('company_id').unsigned().references('id').inTable('companies')
      table.timestamps()
    })
  }

  down () {
    this.drop('markas')
  }
}

module.exports = MarkasSchema
