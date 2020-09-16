'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CompanyRolesSchema extends Schema {
  up () {
    this.create('company_roles', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('company_id').unsigned().references('id').inTable('companies')
      table.integer('code')
      table.timestamps()
    })
  }

  down () {
    this.drop('company_roles')
  }
}

module.exports = CompanyRolesSchema
