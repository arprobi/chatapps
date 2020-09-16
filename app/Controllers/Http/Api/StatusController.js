'use strict'

const { validate }  = use('Validator')
const Status        = use('App/Models/Status')
const Company       = use('App/Models/Company')


class StatusController {
    constructor () {
        this.filepath   = '/home/middleware/files/uploads/status/'
    }

    async all({ params, response }) {
        const status = await Status.query().where('company_id', params.id).with('user').orderBy('created_at', 'asc').fetch()

        return response.json({
            status: 200,
            message: 'Success fetch status',
            data: status
        })
    }

    async store({ request, params, auth, response }) {
        const company = await Company.findOrFail(params.id)

        const rules = {
            message: 'required'
        }

        const validation = await validate(request.only(['message']), rules)
        if (validation.fails()) {
            return response.status(400).send(validation.messages())
        }

        let image_name = ''
        
        if (request.file('image')) {
            const maxfilesize = {size: '5mb'}
            const getfile     = request.file('image', maxfilesize)
            const date        = new Date()
            const filename    = date.getFullYear()+''+(date.getMonth()+1)+''+date.getDate()+''+date.getHours()+''+date.getMinutes() +''+ date.getSeconds()
            
            await getfile.move(this.filepath, {
                name: filename+'.'+getfile.extname
            })

            if (!getfile.moved()) {
                return getfile.error()
            }

            image_name = filename+'.'+getfile.extname
        }

        try {
            const status        = new Status()
            status.message      = request.input('message')
            status.user_id      = auth.current.user.id
            status.image        = image_name
            status.company_id   = params.id
            status.status       = 1

            await status.save()

            return response.json({
                status: 200,
                message: 'Success to save status',
                data: status
            })

        } catch (error) {
            return response.status(200).json({
                status: 500,
                message: 'Cannot save status',
                data: error
            })
        }
        
    }

    async update({ request, params, auth, response }) {
        const status = await Status.findOrFail(params.id)

        const rules = {
            message: 'required'
        }

        const validation = await validate(request.only(['message']), rules)
        if (validation.fails()) {
            return response.status(400).send(validation.messages())
        }

        let image_name = null
        
        if (request.file('image')) {
            const maxfilesize = {size: '5mb'}
            const getfile     = request.file('image', maxfilesize)
            const date        = new Date()
            const filename    = date.getFullYear()+''+(date.getMonth()+1)+''+date.getDate()+''+date.getHours()+''+date.getMinutes() +''+ date.getSeconds()
            
            await getfile.move(this.filepath, {
                name: filename+'.'+getfile.extname
            })

            if (!getfile.moved()) {
                return getfile.error()
            }

            image_name = filename
        } else {
            image_name = status.image
        }

        try {
            status.message      = request.input('message', status.message)
            status.image        = image_name
            status.status       = 1

            await status.save()

            return response.json({
                status: 403,
                message: 'Success to save status',
                data: status
            })

        } catch (error) {
            return response.status(200).json({
                status: 500,
                message: 'Cannot save status',
                data: error
            })
        }
        
    }

    async delete({ params, response, auth }) {
        const status = await Status.findOrFail(params.id)

        if (status.user_id === auth.current.user.id) {
            await status.delete()

            return response.json({
                status: 200,
                message: 'Success to delete status',
                data: status
            })
        }

        return response.json({
            status: 403,
            message: 'Cannot delete this status',
            data: status
        })
    }
}

module.exports = StatusController
