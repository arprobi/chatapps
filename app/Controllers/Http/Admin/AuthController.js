'use strict'

const { validate }  = use('Validator')
const User          = use('App/Models/Admin')

class AuthController {
    async login ({view}) {
        return view.render('modules.auth.login')
    }

    async handleLogin({request, response, auth}) {
        const rules = {
            email: 'required|email',
            password: 'required',
        }
        const { email, password } = request.only(['email', 'password'])
        const validation          = await validate({ email, password }, rules)
        const remember            = request.input('remember') === 1 ? true : false 
    
        if (!validation.fails()) {
            try {
                await auth.authenticator('session').remember(remember).attempt(email, password)
                await User.findBy('email', email)

                return response.redirect('/admin')

            } catch (err) {
                return response.redirect('/admin/login')
            }
        } else {
            return response.redirect('/admin/login')
        }
    }

    async logout ({ auth, response }) {
        try{
            await auth.logout()
            return response.redirect('/admin/login')
        } catch (err) {
            return response.redirect('/admin')
        }
    }

    async profile ({ auth, view }) {
        const profile = await User.findOrFail(auth.user.id)
        return view.render('modules.auth.profile', { profile: profile.toJSON() })
    }
}

module.exports = AuthController
