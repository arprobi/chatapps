'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PersonalChatsSchema extends Schema {
  up () {
    this.create('personal_chats', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('to_id').unsigned().references('id').inTable('users')
      table.text('message')
      table.integer('reply_to').defaultTo(0)
      table.integer('attachment_id').defaultTo(0)
      table.timestamps()
    })
  }

  down () {
    this.drop('personal_chats')
  }
}

module.exports = PersonalChatsSchema
