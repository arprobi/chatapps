'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Marka extends Model {
    /**
     * A relationship 
     * @return {Object}
    */
    company () {
        return this.belongsTo('App/Models/Company')
    }

    users () {
        return this.belongsToMany('App/Models/User').pivotTable('user_markas').withTimestamps()
    }

    events () {
        return this.hasMany('App/Models/MarkasEvent')
    }
}

module.exports = Marka
