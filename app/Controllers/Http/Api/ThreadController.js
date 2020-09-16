'use strict'

const { validate }  = use('Validator')
const Thread        = use('App/Models/Thread')
const { sendNotification, generateMessage  } = use('App/Helpers/FirebaseHelper')

class ThreadController {
    async all({ params, response }) {
        const types = ['project', 'markas', 'team']
        const type  = params.type
        const id    = params.id

        if(types.includes(type)) {
            const threads = await Thread.query()
                                .where('type', type)
                                .where('referenced_to', id)
                                .where('parent_id', 0)
                                .with('user')
                                .with('comments', (builder) => {
                                    builder.with('user')
                                })
                                .orderBy('created_at', 'desc')
                                .fetch()
            
            return response.json({
                status: 200,
                message: `Success fetched ${type} thread!`,
                data: threads
            })
        } else {
            return response.status(404).send({
                status: 404,
                message: 'URL not found!'
            })
        }
    }

    async store({ request, params, response, auth }) {
        const types = ['project', 'markas', 'team']
        const type  = params.type
        const id    = params.id

        const rules = {
			content: 'required',
            parent_id: 'required|integer'
        }

        const validation = await validate(request.only(['content', 'parent_id']), rules)
        if (validation.fails()) {
            return response.status(400).send(validation.messages())
        }

        if(types.includes(type)) {
            try {
                const thread            = new Thread()
                thread.title            = request.input('title', 'Untitled')
                thread.content          = request.input('content')
                thread.user_id          = auth.current.user.id
                thread.parent_id        = parseInt(request.input('parent_id'))
                thread.type             = type
                thread.referenced_to    = parseInt(id)
                
                await thread.save()
                
                return response.json({
                    status: 200,
                    message: `Success created ${type} thread!`,
                    data: thread
                })
            } catch (error) {
                return response.status(500).json({
                    status: 500,
                    message: `Failed to create ${type} thread!`,
                    data: error
                })
            }
            
        } else {
            return response.status(404).send({
                status: 404,
                message: 'URL not found!'
            })
        }
    }

    async update({ request, params, response, auth }) {
        const types   = ['project', 'markas', 'team']
        const type    = params.type
        const id      = params.id
        
        const rules = {
			content: 'required',
            parent_id: 'integer'
        }

        const validation = await validate(request.only(['content', 'parent_id']), rules)
        if (validation.fails()) {
            return response.status(400).send(validation.messages())
        }
        
        const thread  = await Thread.findOrFail(id)

        if(types.includes(type) && thread.type === type) {
            try {
                thread.title   = request.input('title', thread.title)
                thread.content = request.input('content', thread.content)
                
                await thread.save()
                
                return response.json({
                    status: 200,
                    message: `Success updated ${type} thread!`,
                    data: thread
                })
            } catch (error) {
                return response.status(500).json({
                    status: 500,
                    message: `Failed to updated ${type} thread!`,
                    data: error
                })
            }
            
        } else {
            return response.status(404).send({
                status: 404,
                message: 'URL not found!'
            })
        }
    }

    async delete({ params, response }) {
        const types   = ['project', 'markas', 'team']
        const type    = params.type
        const id      = params.id
        
        const thread  = await Thread.findOrFail(id)

        if(types.includes(type) && thread.type === type) {
            try {
                await thread.comments().delete()
                await thread.delete()
                
                return response.json({
                    status: 200,
                    message: `Success deleted ${type} thread!`,
                    data: thread
                })
            } catch (error) {
                return response.status(500).json({
                    status: 500,
                    message: `Failed to deleted ${type} thread!`,
                    data: error
                })
            }
            
        } else {
            return response.status(404).send({
                status: 404,
                message: 'URL not found!'
            })
        }
    }
}

module.exports = ThreadController
