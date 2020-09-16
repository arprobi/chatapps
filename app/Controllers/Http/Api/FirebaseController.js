'use strict'


const { validate }      = use('Validator')
const FirebaseDevice    = use('App/Models/FirebaseDevice')
const { sendNotification, getUserTokenByProject  } = use('App/Helpers/FirebaseHelper')

class FirebaseController {
    async save({ request, auth, response }) {
        const rules = {
			device_id: 'required',
			firebase_token: 'required'
        }
        
        const validation = await validate(request.only(['device_id', 'firebase_token']), rules)

        if (!validation.fails()) {
            try{
                const exist         = await FirebaseDevice.query()
                                                            .where('device_id', request.input('device_id'))
                                                            .where('user_id', auth.current.user.id)
                                                            .getCount()
                if (exist > 0) {
                    await FirebaseDevice.query()
                        .where('device_id', request.input('device_id'))
                        .where('user_id', auth.current.user.id)
                        .update({firebase_token: request.input('firebase_token')})
                        
                    const fcm       = await FirebaseDevice.query().where('device_id', request.input('device_id')).fetch()

                    return response.status(200).send({
                        status: 200,
                        message: 'Firebase token saved!',
                        data: fcm
                    })
                    
                } else {
                    const fcm           = new FirebaseDevice()
                    fcm.user_id         = auth.current.user.id
                    fcm.device_id 	    = request.input('device_id')
                    fcm.firebase_token  = request.input('firebase_token')
                    await fcm.save()
                    
                    return response.status(200).send({
                        status: 200,
                        message: 'Firebase token saved!',
                        data: fcm
                    })
                }
                
			} catch {
				return response.status(200).send({
					status: 500,
					message: 'Save token failed!'
				})
            }
        } else {
            return response.status(400).send(validation.messages())
        }
    }

    async delete ({auth, request, response}) {
        const rules = {
			device_id: 'required',
        }
        
        const validation = await validate(request.only(['device_id']), rules) 

        if (!validation.fails()) {
            try {
                await FirebaseDevice.query().where('user_id', auth.current.user.id).where('device_id', request.input('device_id')).delete()
                return response.status(200).send({
                    status: 200,
                    message: 'Firebase token deleted!'
                })
            } catch (err) {
                return response.status(200).send({
					status: 500,
					message: 'Delete token failed!'
				})
            }
        } else {
            return response.status(400).send(validation.messages())
        }
    }

    async sendMessage({request, response}) {
        const listtoken     = await getUserTokenByProject(message.project_id)
        
        for(let key in listtoken) {
            const message = {
                'to' : listtoken[key]['firebase_token'],
                'notification' : {
                    'title': `New message from ${this.auth.user.id}`,
                    'body' : message.message,
                    'sound': 'default',
                },
                'data' : {
                    'title'         : `New message from ${this.auth.user.id}`,
                    'body'          : message.message,
                    'project_id'    : message.project_id,
                    'message_type'  : 'Chat',
                }
            }
            await sendNotification(message)
        }
    }
}

module.exports = FirebaseController
