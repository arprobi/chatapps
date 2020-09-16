'use strict'

const User          = use('App/Models/User')
const { validate }  = use('Validator')
const Mail          = use('Mail')
const Encryption    = use('Encryption')

class PasswordController {

    async findmail({ view }) {
        return view.render('web.password.findmail')
    }

    async handlemail({ request, response, session }) {
        const rules = {
            email: 'email|required'
        }
        
        const email      = request.input('email')
        const validation = await validate({ email }, rules)

        if (!validation.fails()) {
            const user = await User.findBy('email', email)

            if (!user) {
                session.flash({ failed: 'Your email is not registered!' })
                return response.redirect('/resetpassword/email')
            } else {
                try {
                    const encrypted = Encryption.encrypt(user.username)
                    const link      = `https://middleware.bukapeta.id/resetpassword/${encrypted}`
                    const to 		= email
					const from 		= 'kerja.team.bukapeta@gmail.com'
                    
                    await Mail.send('emails.resetlink', { link: link }, (message) => {
						message
							.to(to)
							.from(from)
							.subject('Your Reset Password Link')
                    })

                    session.flash({ success: 'Please check your email to reset password!' })
                    return response.redirect('/resetpassword/email')
                    
                } catch (error) {
                    session.flash({ failed: error })
                    return response.redirect('/resetpassword/email')
                }
            }

        } else {
            session.withErrors(validation.messages()).flashAll()
            return response.redirect('back')
        }

    }

    async reset({ params, view }) {
        const decrypt   = Encryption.decrypt(params.encrypted)
        const user      = await User.findBy('username', decrypt)

        return view.render('web.password.resetpassword', { user: user.toJSON(), encrypted: params.encrypted })
    }

    async handlereset({ params, request, response, session }) {
        const decrypt   = Encryption.decrypt(request.input('encrypted'))
        
        const rules = {
            new_password: 'min:6|required',
            password_confirmation: 'min:6|required'
        }
        
        const validation = await validate(request.only(['new_password', 'password_confirmation']), rules)
        
        const user      = await User.findBy('username', decrypt)
        
        if (!validation.fails()) {
            if (user) {
                try {
                    if (request.input('new_password') != request.input('password_confirmation')) {
                        session.flash({ failed: 'Password confirmation did not match!' })
                        return response.redirect('back')
                    }
                    user.password = request.input('new_password')
                    await user.save()
    
                    session.flash({ success: 'You are successfully updated your password!' })
                    return response.redirect('back')
                } catch (error) {
                    session.flash({ failed: error })
                    return response.redirect('back')
                }
            }
            session.flash({ failed: 'You are not registered in Kerja.Team!' })
            return response.redirect('back')
        } else {
            session.withErrors(validation.messages()).flashAll()
            return response.redirect('back')
        }
    }
}

module.exports = PasswordController
