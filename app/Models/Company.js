'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Company extends Model {
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
    owner () {
        return this.belongsTo('App/Models/User')
    }

    markas () {
        return this.hasOne('App/Models/Marka')
    }

    projects () {
        return this.manyThrough('App/Models/Team', 'projects')
    }

    teams () {
        return this.hasMany('App/Models/Team')
    }
    
    users () {
        return this.belongsToMany('App/Models/User').pivotTable('user_companies').withTimestamps()
    }

    roles () {
        return this.hasMany('App/Models/CompanyRole')
    }

}

module.exports = Company
