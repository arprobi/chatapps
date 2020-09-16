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


class Thread extends Model {

    static boot () {
        super.boot()

        this.addHook('beforeSave', async (threadInstance) => {
            const user      = await User.findOrFail(threadInstance.user_id)
            let usertokens  = []

            // Init list user token by type
            if (threadInstance.type === 'markas') {
                usertokens = await getUserTokenByMarkas(threadInstance.referenced_to)
            }
            if (threadInstance.type === 'team') {
                usertokens = await getUserTokenByTeam(threadInstance.referenced_to)
            }
            if (threadInstance.type === 'project') {
                usertokens = await getUserTokenByProject(threadInstance.referenced_to)
            }

            // Send notification if list token not empty
            if (usertokens.length) {
                for(let key in usertokens) {
                    if (usertokens[key]['user_id'] != user.id) {
                        const title 	= `New thread in ${threadInstance.type}`
                        const body      = `${user.name} create a new thread in ${threadInstance.type}`
                        const message 	= await generateMessage(usertokens[key]['firebase_token'], title, body, threadInstance.type, 'thread', threadInstance.referenced_to, 'high')
                        await sendNotification(message)
                    }
                }
            }
        })

        this.addHook('afterSave', async (threadInstance) => {
            const user      = await User.findOrFail(threadInstance.user_id)
            const mentioned = await mentionRegex(threadInstance.content)
            if (mentioned.length) {
                const userlist  = await User.query().whereIn('username', mentioned).pluck('id')
                const tokens    = await FirebaseDevice.query().whereIn('user_id', userlist).fetch()
                if (tokens.length) {
                    for(let key in tokens) {
                        if (tokens[key]['user_id'] != user.id) {
                            const title 	= `${user.name} mentioned you`
                            const body      = `You are mentioned by ${user.name} in ${threadInstance.type} thread`
                            const message 	= await generateMessage(tokens[key]['firebase_token'], title, body, threadInstance.type, 'thread', threadInstance.referenced_to, 'high')
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

    comments () {
        return this.hasMany('App/Models/Thread', 'id', 'parent_id')
    }
}

module.exports = Thread
