'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model     = use('Model')
const moment    = require('moment')

class Event extends Model {
    getStartDate(start_date) {
        return moment(start_date).format("YYYY-MM-DD HH:mm:ss");
    }

    getEndDate(end_date) {
        return moment(end_date).format("YYYY-MM-DD HH:mm:ss");
    }

    /**
     * A relationship 
     * @return {Object}
    */
    user() {
        return this.belongsTo('App/Models/User')
    }

}

module.exports = Event
