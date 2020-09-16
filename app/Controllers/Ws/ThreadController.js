'use strict'

const Thread = use('App/Models/Thread')

class ThreadController {
    constructor ({ socket, request, auth }) {
        this.socket     = socket
        this.request    = request
        this.auth       = auth
    }

    onMessage (message) {
        const thread          = new Thread()
        thread.content        = message.content
        thread.type           = message.type
        thread.user_id        = this.auth.user.id
        thread.parent_id      = message.parent_id
        thread.referenced_to  = message.referenced_to
        
        thread.save().then(() => {
            Object.assign(thread, { user: this.auth.user })
            this.socket.broadcastToAll('message', thread)
        })
    }
}

module.exports = ThreadController
