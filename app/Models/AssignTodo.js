'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class AssignTodo extends Model {
    /**
     * A relationship 
     * @return {Object}
    */
    user () {
        return this.belongsTo('App/Models/User')
    }

    todo () {
        return this.belongsTo('App/Models/Todo')
    }
}

module.exports = AssignTodo
