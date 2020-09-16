'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class FirebaseDevicesSchema extends Schema {
  up () {
    this.create('firebase_devices', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('device_id')
      table.string('firebase_token')
      table.timestamps()
    })
  }

  down () {
    this.drop('firebase_devices')
  }
}

module.exports = FirebaseDevicesSchema
