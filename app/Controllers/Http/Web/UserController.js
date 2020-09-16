'use strict'


const User          = use('App/Models/User')
const { validate }  = use('Validator')
const Mail          = use('Mail')
const Encryption    = use('Encryption')

class UserController {
    async activation({ params, view }) {
        const decrypt = Encryption.decrypt(params.encrypted)
        const user    = await User.findBy('username', decrypt)

        await User.query().where('username', decrypt).update({ email_status: 1 })

        return view.render('web.user.activation')
    }
}

module.exports = UserController
