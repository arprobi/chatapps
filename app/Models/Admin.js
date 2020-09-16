'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Hash  = use('Hash')
const Model = use('Model')

class Admin extends Model {
    static get hidden () {
        return ['password']
    }

    static get computed () {
        return ['str_status']
    }

    static get computed () {
        return ['str_status']
    }

    static boot () {
        super.boot()

        this.addHook('beforeSave', async (userInstance) => {
            if (userInstance.dirty.password) {
                userInstance.password = await Hash.make(userInstance.password)
            }
        })
    }
    
    /**
         * A Getter 
         * @return {String}
        */
    getStrStatus({status}) {
    if (status === 0) {
        return 'inactive'
    } else if (status === 1) {
        return 'active'
    } else {
        return 'blocked'
    }
}
}

module.exports = Admin
