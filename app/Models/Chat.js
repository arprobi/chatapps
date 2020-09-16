'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

const User              = use('App/Models/User')
const FirebaseDevice    = use('App/Models/FirebaseDevice')
const { sendNotification, 
        generateMessage, 
        getUserTokenByCompany, 
        getUserTokenByMarkas, 
        getUserTokenByTeam, 
        getUserTokenByProject 
} = use('App/Services/FirebaseService')
const { mentionRegex }  = use('App/Helpers/UtilsHelper')


class Chat extends Model {
    static boot () {
        super.boot()

        this.addHook('beforeSave', async (chatInstance) => {
            const user      = await User.findOrFail(chatInstance.user_id)
            let usertokens  = []

            // Init list user token by type
            if (chatInstance.type === 'markas') {
                usertokens = await getUserTokenByMarkas(chatInstance.reference_id)
            }
            if (chatInstance.type === 'team') {
                usertokens = await getUserTokenByTeam(chatInstance.reference_id)
            }
            if (chatInstance.type === 'project') {
                usertokens = await getUserTokenByProject(chatInstance.reference_id)
            }

            // Send notification if list token not empty
            if (usertokens.length) {
                for(let key in usertokens) {
                    if (usertokens[key]['user_id'] != user.id) {
                        const title 	= `New ${chatInstance.type} message`
                        const body      = `Message from ${user.name} : ${chatInstance.message}`
                        const message 	= await generateMessage(usertokens[key]['firebase_token'], title, body, chatInstance.type, 'discuss', chatInstance.reference_id)
                        await sendNotification(message)
                    }
                }
            }
        })

        this.addHook('afterSave', async (chatInstance) => {
            const user      = await User.findOrFail(chatInstance.user_id)
            const mentioned = await mentionRegex(chatInstance.message)
            if (mentioned.length) {
                const userlist  = await User.query().whereIn('username', mentioned).pluck('id')
                const tokens    = await FirebaseDevice.query().whereIn('user_id', userlist).fetch()
                if (tokens.length) {
                    for(let key in tokens) {
                        if (tokens[key]['user_id'] != user.id) {
                            const title 	= `${user.name} mentioned you`
                            const body      = `You are mentioned by ${user.name} in ${chatInstance.type} discussion message`
                            const message 	= await generateMessage(tokens[key]['firebase_token'], title, body, chatInstance.type, 'discuss', chatInstance.reference_id)
                            await sendNotification(message)
                        }
                    }
                }
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

    replyto () {
        return this.hasOne('App/Models/Chat', 'reply_to', 'id')
    }

    attachment () {
        return this.hasOne('App/Models/File', 'attachment_id', 'id')
    }
}

module.exports = Chat
