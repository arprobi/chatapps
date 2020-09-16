'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class FileComment extends Model {
    /**
     * A relationship 
     * @return {Object}
    */
    file () {
        return this.belongsTo('App/Models/File')
    }

    comments () {
        return this.hasMany('App/Models/FileComment', 'id', 'parent_id')
    }

    user () {
        return this.belongsTo('App/Models/User')
    }
}

module.exports = FileComment
