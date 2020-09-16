'use strict'

const Hash  = use('Hash')
const Model = use('Model')

class User extends Model {

    static get hidden () {
        return ['password']
    }

    static get computed () {
        return ['str_status', 'avatar_url']
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
        let string
        switch (status) {
            case 3:
                string = 'blocked'
                break;
            case 1:
                string = 'active'
                break;
            case 2:
                string = 'premium'
                break;
            default:
                string = 'inactive'
                break;
        }

        return string
    }

    getAvatarUrl({ avatar }) {
        if (!avatar) {
            return `https://files.kerja.team/avatars/avatar-user.jpg`
        } else {
            return `https://files.kerja.team/avatars/${avatar}`
        }
    }

    /**
     * A relationship 
     * @return {Object}
    */
    companies () {
        return this.belongsToMany('App/Models/Company').pivotTable('user_companies').withTimestamps()
    }

    markas () {
        return this.belongsToMany('App/Models/Marka').pivotTable('user_markas').withTimestamps()
    }

    teams () {
        return this.belongsToMany('App/Models/Team').pivotTable('user_teams').withTimestamps()
    }

    projects () {
        return this.belongsToMany('App/Models/Project').pivotTable('user_projects').withTimestamps()
    }

    devices () {
        return this.hasMany('App/Models/FirebaseDevice')
    }

    tokens () {
        return this.hasMany('App/Models/Token')
    }
}

module.exports = User
