'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserMarkasSchema extends Schema {
  up () {
    this.create('user_markas', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('markas_id').unsigned().references('id').inTable('markas')
      table.timestamps()
    })
  }

  down () {
    this.drop('user_markas')
  }
}

module.exports = UserMarkasSchema
