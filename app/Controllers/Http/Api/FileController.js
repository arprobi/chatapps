'use strict'

const { validate }  = use('Validator')
const Helpers       = use('Helpers')
const File          = use('App/Models/File')
const FileComment   = use('App/Models/FileComment')

class FileController {
    constructor () {
        this.type       = ['company', 'markas', 'team', 'project']
        this.filepath   = '/home/middleware/files/uploads/'
    }

    async all({ response, params }) {
        const type  = params.type
        const id    = params.id
        
        if (!this.type.includes(type)) {
            return response.status(404).send({
                status: 404,
                message: `URL not found!`,
            })
        }
    
        const files = await File.query().where('type', type).where('reference_id', id).fetch()

        return response.status(200).send({
            status: 200,
            message: `File in ${type} fetched!`,
            data: files
        })
    }

	async uploadfile({ params, request, response, auth }) {
        const type  = params.type
        const id    = params.id

        if (!this.type.includes(type)) {
            return response.status(404)
        }

        const rules = {
            title: 'string|max:100',
            description: 'max:225'
		}

        const validation  = await validate(request.only(['title', 'description']), rules)

        if (validation.fails()) {
            response.status(400).send(validation.messages())
        }
        
        if (request.file('file')) {
            const maxfilesize = {size: '20mb'}
            const getfile     = request.file('file', maxfilesize)
            const date        = new Date()
            const filename    = date.getFullYear()+''+(date.getMonth()+1)+''+date.getDate()+''+date.getHours()+''+date.getMinutes() +''+ date.getSeconds()
            
            await getfile.move(this.filepath, {
                name: filename+'.'+getfile.extname
            })

            if (!getfile.moved()) {
                return getfile.error()
            } else {
                try {
                    const file          = new File()
                    file.title          = request.input('title')
                    file.name           = filename
                    file.type           = type
                    file.description    = request.input('description')
                    file.user_id        = auth.current.user.id
                    file.reference_id   = parseInt(id)
                    file.extension      = getfile.extname
    
                    await file.save()
                    
                    return response.status(200).send({
                        status: 200,
                        message: 'File saved!',
                        data: file
                    })
                } catch (error) {
                    return response.status(200).send({
                        status: 500,
                        message: 'Save file failed, something wrong!',
                        data: error
                    })
                }
            }
        } else {
            const file          = new File()
            file.title          = request.input('title')
            file.name           = request.input('file')
            file.type           = type
            file.description    = request.input('description')
            file.user_id        = auth.current.user.id
            file.reference_id   = parseInt(id)
            file.extension      = 'link'

            try {
                await file.save()

                return response.status(200).send({
                    status: 200,
                    message: 'File saved!',
                    data: file
                })
            } catch (error) {
                return response.status(200).send({
                    status: 500,
                    message: 'Save file failed, something wrong!',
                    data: error
                })
            }
        }
    }

    async detail({ params, response }) {
        const file = await File.findOrFail(params.id)

        return response.status(200).send({
            status: 200,
            message: 'Detail file fetched!',
            data: file
        })
    }

    async delete({ params, response }) {
        const file    = await File.findOrFail(params.id)
        
        let status    = ''
        
        try {
            if(file.extension != 'link') {
                try {
                    const fs = Helpers.promisify(require('fs'))
                    await fs.unlink(`${this.filepath}${file.name}.${file.extension}`)
                } catch(error) {
                    status = error
                }
            }

            await file.delete()

            return response.status(200).send({
                status: 200,
                message: 'File deleted!',
                data: file
            })
        } catch(error) {
            return response.status(200).send({
                status: 500,
                message: `Delete file failed! ${error}`,
                data: file
            })
        }
    }

    async getcomment({ params, request, response, auth }) {
        const file      = await File.findOrFail(params.id)
        const comments  = await file.comments().with('user').with('comments').where('parent_id', 0).fetch()

        return response.status(200).send({
            status: 200,
            message: 'File comments fetched!',
            file: file,
            data: comments
        })
    }

    async postcomment({ params, request, response, auth }) {
        const file      = await File.findOrFail(params.id)

        const rules = {
            message: 'string|required',
            parent_id: 'max:225'
        }

        const validation = await validate(request.only(['message', 'parent_id']), rules)
        if (validation.fails()) {
            return response.status(400).send(validation.messages())
        }

        try {
            const comment       = await new FileComment()
            comment.message     = request.input('message', 0)
            comment.user_id     = auth.current.user.id
            comment.parent_id   = request.input('parent_id', 0)
            comment.file_id     = file.id

            await comment.save()

            await Object.assign(comment, { user: auth.current.user })

            return response.send({
                status: 200,
                message: 'File comments fetched!',
                file: file,
                data: comment
            })

        } catch (error) {
            return response.status(200).send({
                status: 500,
                message: 'Failed to comment file',
                data: error
            })
        }
    }

    async deletecomment({ params, request, response, auth }) {
        try {
            const comments  = await FileComment.where('id', params.id).orWhere('parent_id', params.id).delete()

            return response.status(200).send({
                status: 200,
                message: 'File comments fetched!',
                data: comments
            })
        } catch (error) {
            return response.status(200).send({
                status: 500,
                message: 'Delete file comment failed!',
                data: error
            })
        }
        
    }

}

module.exports = FileController
