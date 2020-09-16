'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserCompaniesSchema extends Schema {
  up () {
    this.create('user_companies', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('company_id').unsigned().references('id').inTable('companies')
      table.timestamps()
    })
  }

  down () {
    this.drop('user_companies')
  }
}

module.exports = UserCompaniesSchema
