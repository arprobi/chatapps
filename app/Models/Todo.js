'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model         = use('Model')
const Event         = use('App/Models/Event')
const Notification  = use('App/Models/Notification')


class Todo extends Model {
    static boot() {
        super.boot()

        this.addHook('afterSave', async(todoInstance) => {
            // Save event
            const event          = new Event()
            event.title          = todoInstance.name
            event.user_id        = todoInstance.user_id
            event.description    = `Event created from ${todoInstance.type} todos`
            event.event          = 'todos'
            event.type           = todoInstance.type
            event.start_date     = todoInstance.due_date
            event.end_date       = todoInstance.due_date
            event.reference_id   = todoInstance.reference_id
            
            await event.save()
        })
    }
    /**
     * A relationship 
     * @return {Object}
    */

    user() {
        return this.belongsTo('App/Models/User')
    }

    childs () {
        return this.hasMany('App/Models/Todo', 'id', 'parent_id')
    }

    assignto() {
        return this.hasMany('App/Models/AssignTodo')
    }

    comments() {
        return this.hasMany('App/Models/CommentTodo')
    }
}

module.exports = Todo
