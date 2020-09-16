'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EventsSchema extends Schema {
  up () {
    this.create('events', (table) => {
      table.increments()
      table.string('title', 150).nullable()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('description').nullable()
      table.string('event').nullable()
      table.datetime('start_date', 6).nullable()
      table.datetime('end_date', 6).nullable()
      table.string('type', 10).defaultTo('company') // company, markas, team, project
      table.integer('reference_id').defaultTo(0) // id from type
      table.timestamps()
    })
  }

  down () {
    this.drop('events')
  }
}

module.exports = EventsSchema
