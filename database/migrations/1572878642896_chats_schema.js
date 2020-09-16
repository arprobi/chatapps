'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ChatsSchema extends Schema {
  up () {
    this.create('chats', (table) => {
      table.increments()
      table.text('message')
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('reply_to').defaultTo(0)
      table.integer('attachment_id').defaultTo(0)
      table.string('type', 10).defaultTo('company') // company, markas, team, project
      table.integer('reference_id').defaultTo(0)  // id from type
      table.timestamps()
    })
  }

  down () {
    this.drop('chats')
  }
}

module.exports = ChatsSchema
