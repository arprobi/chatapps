'use strict'

const Ws            = use('Ws')
const PersonalChat 	= use('App/Models/PersonalChat')
const User 	        = use('App/Models/User')

class PersonalChatController {
    constructor ({ socket, request, auth }) {
        this.socket     = socket
        this.request    = request
        this.auth       = auth
    }

    onMessage (message) {
        const chat          = new PersonalChat()
        chat.message        = message.message
        chat.to_id          = message.to_id
        chat.user_id        = this.auth.user.id
        chat.reply_to       = message.reply_to
        chat.attachment_id  = message.attachment_id
    
        chat.save().then(() => {
            //send to destination
            Object.assign(chat, { replyto: message.replyto })
            Object.assign(chat, { attachment: message.attachment })

            const channel   = Ws.getChannel('personal:*')
            const fromtopic = channel.topic(`personal:${this.auth.user.id}`)
            const totopic   = channel.topic(`personal:${message.to_id}`)
            fromtopic.broadcastToAll('message', chat);
            totopic.broadcastToAll('message', chat);
        })
    }
}

module.exports = PersonalChatController
