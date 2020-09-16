'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('name', 80).notNullable()
      table.string('username', 100).notNullable().unique()
      table.string('email', 100).notNullable().unique()
      table.string('password', 100).notNullable()
      table.integer('status').defaultTo(1)
      table.string('avatar').nullable()
      table.integer('email_status').defaultTo(0)
      table.datetime('pay_at').nullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
