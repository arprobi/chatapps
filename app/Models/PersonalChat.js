'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

const User              = use('App/Models/User')
const FirebaseDevice    = use('App/Models/FirebaseDevice')
const { sendNotification, generateMessage  } = use('App/Helpers/FirebaseHelper')


class PersonalChat extends Model {
    static boot() {
        super.boot()

        this.addHook('afterSave', async(personalInstance) => {
            // Send FCM
            const token     = await FirebaseDevice.query().where('user_id', personalInstance.to_id).first()
            const user      = await User.findBy('id', personalInstance.to_id)
            const title 	= `New message from ${user.name}`
            const body		= personalInstance.message
            const message 	= await generateMessage(token.firebase_token, title, body, 'personal', 'personal', user.id)
            await sendNotification(message)
        })
    }

    /**
     * A relationship 
     * @return {Object}
    */
    user () {
        return this.belongsTo('App/Models/User')
    }

    to () {
        return this.hasOne('App/Models/User', 'to_id', 'id')
    }

    replyto () {
        return this.hasOne('App/Models/PersonalChat', 'reply_to', 'id')
    }
}

module.exports = PersonalChat
