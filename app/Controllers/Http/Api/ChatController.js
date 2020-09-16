'use strict'

const { validate }  = use('Validator')
const Chat 	        = use('App/Models/Chat')


class ChatController {
    constructor () {
        this.type       = ['company', 'markas', 'team', 'project']
    }

    async all ({ params, response }) {
        const type  = params.type
		const id    = params.id
		
		if (!this.type.includes(type)) {
            return response.status(404).send({
                status: 404,
                message: `URL not found!`,
            })
        }
		
        const chats = await Chat.query().with('user').with('replyto').with('attachment')
                                .where('type', type).where('reference_id', id)
                                .orderBy('created_at', 'asc').fetch()
		
		return response.status(200).send({
			status: 200,
			message: `All chats ${type} fetched!`,
			data: chats
		})
    }

    async store({ params, request, response, auth }) {
        const type  = params.type
		const id    = params.id
		
		if (!this.type.includes(type)) {
            return response.status(404).send({
                status: 404,
                message: `URL not found!`,
            })
        }

        const rules = {
			message: 'required|max:250',
        }
        
        const validation = await validate(request.only(['message']), rules)

        if (validation.fails()) {
            response.status(400).send(validation.messages())
        }

        try {
            const chat          = new Chat()
            chat.message        = request.input('message')
            chat.type           = type
            chat.user_id        = auth.current.user.id
            chat.reference_id   = parseInt(id)
            chat.reply_to       = parseInt(request.input('reply_to', 0))
            chat.attachment_id  = parseInt(request.input('attachment_id', 0))
            
            await chat.save()

            return response.json({
                status: 200,
                message: `Success to create a chat in ${type}!`,
                data: chat
            })

        } catch (error) {
            return response.status(200).send({
                status: 500,
                message: `Failed to create a chat!`,
                data: error
            })
        }
    }
}

module.exports = ChatController
