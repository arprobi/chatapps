'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

const User              = use('App/Models/User')
const FirebaseDevice    = use('App/Models/FirebaseDevice')
const { sendNotification, generateMessage  } = use('App/Helpers/FirebaseHelper')


class Notification extends Model {
    static boot() {
        super.boot()

        this.addHook('afterSave', async(notificationInstance) => {
            const user      = await User.findOrFail(notificationInstance.user_id)
            // Send FCM
            const token     = await FirebaseDevice.query().where('user_id', notificationInstance.user_id).first()
            if (token) {
                const message 	= await generateMessage(
                                            token.firebase_token, 
                                            notificationInstance.title, 
                                            notificationInstance.message, 
                                            notificationInstance.type, 
                                            notificationInstance.subtype, 
                                            notificationInstance.reference_id)
                await sendNotification(message)
            }
        })
    }


    /**
     * A relationship 
     * @return {Object}
    */
    user () {
        return this.belongsTo('App/Models/User')
    }
}

module.exports = Notification
