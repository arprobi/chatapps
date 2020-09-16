'use strict'

const Ws    = use('Ws')
const Chat  = use('App/Models/Chat')
const User 	= use('App/Models/User')

class ChatController {
    constructor ({ socket, request, auth }) {
        this.socket     = socket
        this.request    = request
        this.auth       = auth
    }

    onMessage (message) {
        const chat           = new Chat()
        chat.message         = message.message
        chat.user_id         = this.auth.user.id
        chat.type            = message.type
        chat.reference_id    = message.reference_id
        chat.reply_to        = message.reply_to
        chat.attachment_id   = message.attachment_id
        
        chat.save().then(() => {
            Object.assign(chat, { user: this.auth.user })
            Object.assign(chat, { replyto: message.replyto })
            Object.assign(chat, { attachment: message.attachment })
            
            this.socket.broadcastToAll('message', chat)
        })
    }
}

module.exports = ChatController
