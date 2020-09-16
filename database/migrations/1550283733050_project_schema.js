'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProjectSchema extends Schema {
    up () {
        this.create('projects', (table) => {
            table.increments()
            table.string('project_name', 254).notNullable()
            table.integer('user_id').unsigned().references('id').inTable('users')
            table.integer('company_id').unsigned().references('id').inTable('companies')
            table.string('project_logo').nullable()
            table.text('project_description').nullable()
            table.datetime('start_date', 6).nullable()
            table.datetime('due_date', 6).nullable()
            table.integer('status').defaultTo(0)
            table.timestamps()
        })
    }

    down () {
        this.drop('projects')
    }
}

module.exports = ProjectSchema
