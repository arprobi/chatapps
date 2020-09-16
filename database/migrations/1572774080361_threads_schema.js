'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ThreadsSchema extends Schema {
  up () {
    this.create('threads', (table) => {
      table.increments()
      table.text('title')
      table.text('content')
      table.string('type', 15)
      table.integer('parent_id')
      table.integer('user_id')
      table.integer('referenced_to')
      table.timestamps()
    })
  }

  down () {
    this.drop('threads')
  }
}

module.exports = ThreadsSchema
