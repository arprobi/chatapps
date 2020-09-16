'use strict'

const { validate }  = use('Validator')
const Hash          = use('Hash')
const Helpers       = use('Helpers')
const Database      = use('Database')
const User          = use('App/Models/User')
const Company       = use('App/Models/Company')
const Marka         = use('App/Models/Marka')
const Mail 			= use('Mail')
const Encryption    = use('Encryption')

class AuthController {

    async register({ request, auth, response }) {
        const rules = {
            name: 'required',
            username: 'required|unique:users,username',
            email: 'required|email|unique:users,email',
            password: 'required|min:6',
            company_name: 'required|max:200',
            company_description: 'max:300',
        }

        const { name, username, email, password, company_name, company_description } = 
            request.only(['name', 'username', 'email', 'password', 'company_name', 'company_description'])
        
        const validation = 
            await validate({ name, username, email, password, company_name, company_description }, rules)

        if (!validation.fails()) {
            try {
                // Create user
                const user      = new User()
                user.name       = request.input('name')
                user.username   = request.input('username')
                user.email      = request.input('email')
                user.password   = request.input('password')
                user.status     = 1
                
                await user.save()

                // Craete company
                const company 		= new Company()
				company.name 		= request.input('company_name')
				company.user_id 	= user.id
				company.logo        = request.input('company_logo')
				company.description = request.input('company_description')
                company.status 	    = parseInt(0)

                await company.save()

                // Craete markas
                const markas 		= new Marka()
				markas.name 		= company.name
                markas.company_id 	= company.id
                
                await markas.save()
                
                // Get new user and company and  Add user to company & markas
                const newuser       = await User.findOrFail(user.id)
                await newuser.companies().attach([company.id])
                await newuser.markas().attach([markas.id])
                const newcompany    = await Company.query().with('markas').where('id', company.id).fetch()

                const token = await auth.authenticator('jwt').withRefreshToken().generate(newuser)
                
                Object.assign(user, token)

                try {
                    // Send email
                    const encrypted = Encryption.encrypt(newuser.username)
                    const link      = `https://middleware.bukapeta.id/activation/${encrypted}`
                    const to 		= newuser.email
                    const from 		= 'bukapeta@noreply.com'
                    await Mail.send('emails.activation', { company: newcompany.toJSON(), user: newuser.toJSON(), link: link }, (message) => {
                        message
                            .to(to)
                            .from(from)
                            .subject('Activation user registration Kerja Team')
                    })
                } catch (error) {
                    console.log('Error', error)
                }

                return response.json({
                    status: 200,
                    message: 'Register success!',
                    data: { user: newuser, company: newcompany }
                })

            } catch (err) {
                response.status(200).send({ error: 'Failed to create user!' })
            }
        } else {
            response.status(401).send(validation.messages())
        }
    }

    async login({ request, auth, response }) {
        const rules = {
            email: 'required|email',
            password: 'required',
        }

        const { email, password } = request.only(['email', 'password'])

        const validation          = await validate({ email, password }, rules)

        if (!validation.fails()) {
            try {
                const user  = await User.findBy('email', email)
                const token = await auth.authenticator('jwt').withRefreshToken().attempt(email, password)

                Object.assign(user, token)

                return response.json({
                    status: 200,
                    message: 'Login success!',
                    data: user
                })
            } catch (err) {
                response.status(200).send({ status: 401, message: 'Email/password not match!' })
            }
        } else {
            response.status(401).send(validation.messages())
        }
    }

    async profile({ response, auth }) {
        const profile = await User.findOrFail(auth.current.user.id)

        response.status(200).send({
            status: 200,
            missage: 'Profile fetched!',
            data: profile
        })
    }

    async update({ request, response, auth }) {
        const rules = {
            name: 'string',
            username: `string|unique:users,username,id,${auth.current.user.id}`,
            email: `email|unique:users,email,id,${auth.current.user.id}`
        }

        const validation = await validate(request.only(['name', 'username', 'email']), rules)

        if (!validation.fails()) {
            try {
                const user      = await User.findOrFail(auth.current.user.id)
                let avatarfile  = user.avatar
                if (request.file('avatar')) {
                    const maxfilesize = {size: '5mb'}
                    const getfile     = request.file('avatar', maxfilesize)
                    const date        = new Date()
                    const filename    = `${date.getFullYear()}${date.getMonth()+1}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`
                    
                    await getfile.move('/home/middleware/files/avatars', {
                        name: filename+'.'+getfile.extname
                    })

                    if (!getfile.moved()) {
                        return getfile.error()
                    } else {
                        avatarfile = filename+'.'+getfile.extname
                    }

                    try {
                        const fs = Helpers.promisify(require('fs'))
                        await fs.unlink(`/home/middleware/files/avatars/${user.avatar}`)
                    } catch (error) {
                        error
                    }
                }
                
                if (request.input('new_password')) {
                    const puser = await Database.table('users').where('id', auth.current.user.id).first()
                    const prules = {
                        password: 'required|min:6',
                        new_password: 'required|min:6'
                    }
                    
                    const { password, new_password } = request.only(['password', 'new_password'])
                    const pvalidation = await validate({ password, new_password }, prules)
                    if (!pvalidation.fails()) {
                        const check = await Hash.verify(password, puser.password)
                        if (check) {
                            user.name       = request.input('name', user.name)
                            user.username   = request.input('username', user.username)
                            user.email      = request.input('email', user.email)
                            user.password   = new_password
                            user.avatar     = avatarfile
                            
                            await user.save()
                            
                            return response.json({
                                status: 200,
                                message: 'Users updated!',
                                data: user
                            })
                        } else {
                            return response.json({
                                status: 403,
                                message: 'Old password not match!'
                            })
                        }
                    } else {
                        return response.status(401).send(pvalidation.messages())
                    }
                } else {
                    user.name       = request.input('name', user.name)
                    user.username   = request.input('username', user.username)
                    user.email      = request.input('email', user.email)
                    user.avatar     = avatarfile
                    
                    await user.save()
                    
                    return response.json({
                        status: 200,
                        message: 'Users updated!',
                        data: user
                    })
                }
            } catch (err) {
                return response.status(200).send({ error: 'Failed to update user, something wrong!' })
            }
        } else {
            return response.status(401).send(validation.messages())
        }
    }

    async refreshToken({ request, auth }) {
        const refreshToken = request.input('refresh_token')
        return await auth
            .newRefreshToken()
            .generateForRefreshToken(refreshToken)
    }

    async logout({ auth, response }) {
        try {
            const apiToken = auth.getAuthHeader()
            await auth
                .authenticator('jwt')
                .revokeTokens([apiToken])
            
            return response.json({
                status: 200,
                message: 'Logout success!',
            })
        } catch(error) {
            return response.status(200).send({
                status: 500,
                message: 'Failed!',
            })
        }

    }
}

module.exports = AuthController
