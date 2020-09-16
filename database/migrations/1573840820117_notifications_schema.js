'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NotificationsSchema extends Schema {
  up () {
    this.create('notifications', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('title').nullable()
      table.string('message').nullable()
      table.string('type').defaultTo('general')
      table.string('subtype').defaultTo('general')
      table.integer('reference_to').defaultTo(0)
      table.integer('status').defaultTo(0)
      table.integer('read').defaultTo(0)
      table.timestamps()
    })
  }

  down () {
    this.drop('notifications')
  }
}

module.exports = NotificationsSchema
