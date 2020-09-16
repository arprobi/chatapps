'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Team extends Model {

    static get computed () {
        return ['str_status']
    }

    /**
     * A Getter 
     * @return {String}
    */
    getStrStatus({status}) {
        if (status === 0) {
            return 'inactive'
        } else {
            return 'active'
        }
    }
    /**
     * A relationship 
     * @return {Object}
    */
    company () {
        return this.belongsTo('App/Models/Company')
    }
    
    owner () {
        return this.belongsTo('App/Models/User')
    }

    users () {
        return this.belongsToMany('App/Models/User').pivotTable('user_teams').withTimestamps()
    }
}

module.exports = Team
