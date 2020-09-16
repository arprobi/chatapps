'use strict'

const PersonalChat = use('App/Models/PersonalChat')
const User         = use('App/Models/User')
const Database     = use('Database')
const { validate } = use('Validator')


class PersonalChatController {
    async mychat({ response, auth }) {
        const usersid = await Database.table('personal_chats').where('to_id', '>', 0).distinct('to_id').pluck('to_id')
        const mychats = await User.query().whereIn('id', usersid).whereNotIn('id', [auth.current.user.id]).fetch()
        
        return response.json({
            status: 200,
            message: 'Success to load message',
            data: mychats
        })
    }

    async detail({ params, response, auth }) {
        const mychats = await PersonalChat.query()
                                .whereIn('user_id', [auth.current.user.id, params.user_id])
                                .whereIn('to_id', [auth.current.user.id, params.user_id])
                                .with('replyto')
                                .orderBy('created_at', 'asc')
                                .fetch()

        return response.json({
            status: 200,
            message: 'Success to load message',
            data: mychats
        })
    }

    async store({ params, request, response, auth }) {
        const user    = await User.findOrFail(params.user_id)
        
        const rules = {
            message: 'required',
            reply_to: 'integer',
            attachment_id: 'integer'
        }

        const validation = await validate(request.only(['message', 'reply_to']), rules)
        
        if (validation.fails()) {
            return response.status(400).send(validation.messages())
        }

        try {
            const chat          = new PersonalChat()
            chat.message        = request.input('message')
            chat.to_id          = user.id
            chat.user_id        = auth.current.user.id
            chat.reply_to       = parseInt(request.input('reply_to', 0))
            chat.attachment_id  = parseInt(request.input('attachment_id', 0))

            await chat.save()

            return response.json({
                status: 200,
                message: 'Success to send message',
                data: chat
            })
        } catch (error) {
            return response.status(200).json({
                status: 500,
                message: 'Failed to send message',
                data: error
            })
        }

    }
}

module.exports = PersonalChatController
