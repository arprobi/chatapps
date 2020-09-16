'use strict'


const Helpers       = use('Helpers')
const Team          = use('App/Models/Team')
const User          = use('App/Models/User')
const ImportService = use('App/Services/ImportService')
const { validate }  = use('Validator')


class UserController {
    async index({ view }) {
        return view.render('modules.users.index')
    }

    async show({ view, params, response }) {

    }

    async edit({ view, params }) {
        const user = await User.findOrFail(params.id)

        return view.render('modules.users.edit', { user: user.toJSON() })
    }

    async update({ request, params, response, session }) {
        const user  = await User.findOrFail(params.id)

        const rules = {
            name: 'required|string|max:150',
            email: `required|email|unique:users,email,id,${user.id}`,
            username: `required|string|unique:users,username,id,${user.id}`
        }

        const validation = await validate(request.only(['name', 'email', 'username']), rules)

        if (!validation.fails()) {
            try {
                if (request.input('password')) {
                    const prules = {
                        password: 'min:6',
                        confirm_password: 'min:6'
                    }
                    const pvalidation = await validate(request.only(['name', 'email', 'username']), prules)
                    
                    if (!pvalidation.fails()) {
                        if (request.input('password') != request.input('confirm_password')) {
                            session.flash({ error: 'Your confirmation password is not match!' })
                            return response.redirect('back')
                        }
                        user.name       = request.input('name', user.name)
                        user.email      = request.input('email', user.email)
                        user.username   = request.input('username', user.username)
                        user.password   = request.input('password')
                        user.status     = request.input('status', user.status)

                        await user.save()

                        session.flash({ success: 'You have been saved data!' })
                        return response.redirect('/admin/users')
                        
                    } else {
                        session.withErrors(validation.messages()).flashAll()
                        return response.redirect('back')
                    }
                } else {
                    user.name       = request.input('name', user.name)
                    user.email      = request.input('email', user.email)
                    user.username   = request.input('username', user.username)
                    user.status     = request.input('status', user.status)
                    
                    await user.save()

                    session.flash({ success: 'You have been saved data!' })
                    return response.redirect('/admin/users')
                }

            } catch(error) {
                session.withErrors(error).flashAll()
                return response.redirect('back')
            }
        } else {
            session.withErrors(validation.messages()).flashAll()
            return response.redirect('back')
        }
    }
    
    async fetchData({ response }) {
        const users = await User.query().orderBy('created_at', 'desc').fetch()
        return response.json({ data: users })
    }

    async importView({ view }) {
        const teams = await Team.query().with('company').fetch()
        return view.render('modules.users.import', { teams: teams.toJSON() })
    }

    async importData({ request, response, view }) {
        const filename      = 'TestingImport.xlsx'
        // const file      = request.file('file')
        // const filename  = `${new Date().getTime()}.${file.extname}`

        // move upload file to custom model
        // await file.move(Helpers.publicPath('import'), {
        //     name: filename
        // })

        // if (!file.moved()) {
            // session.flash({ error: 'You failed to saved data!, something gone wrong' })
            
            // return response.redirect('/admin/users/import')
        // } else {
            const send = await ImportService.ImportUserWithoutTeamId('public/import/' + filename, 1)
            return send
            // session.flash({ success: 'You successfully saved data!' })
            // return response.redirect('/admin/users/import')
        // }
    }
}

module.exports = UserController
