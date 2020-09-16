'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Status extends Model {
    static get computed () {
        return ['image_url']
    }

    /**
     * A Getter 
     * @return {String}
    */
    getImageUrl({image}) {
        if (image) {
            return `https://files.kerja.team/uploads/status/${image}`
        } else {
            return null
        }
    }

    /**
     * A relationship 
     * @return {Object}
    */
    user () {
        return this.belongsTo('App/Models/User')
    }
}

module.exports = Status
