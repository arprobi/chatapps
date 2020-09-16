'use strict'

const Notification  = use('App/Models/Notification')
const User          = use('App/Models/User')

class NotificationController {
    async all({ auth, response }) {
        
        const notif = await Notification.query().where('user_id', auth.current.user.id).fetch()

        return response.status(200).send({
            status: 200,
            message: 'Data fetched!',
            data: notif
        })
    }

    async read({ params, response }) {
        const notif = await Notification.findOrFail(params.id)
        notif.read  = 1
        try {
            await notif.save()
            return response.status(200).send({
                status: 200,
                message: 'Data fetched!',
                data: notif
            })        
        } catch (error) {
            return response.status(200).send({
                status: 500,
                message: error
            })
        }
    }

    async delete ({ params, response }) {
        const notif = await Notification.findOrFail(params.id)

        try {
            await notif.delete()

            return response.status(200).send({
                status: 200,
                message: 'Data deleted!',
                data: notif
            })  
        } catch (error) {
            return response.status(200).send({
                status: 500,
                message: error
            })
        }
    }
}

module.exports = NotificationController
