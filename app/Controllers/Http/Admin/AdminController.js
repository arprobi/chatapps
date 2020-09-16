'use strict'

const { validate }  = use('Validator')
const User          = use('App/Models/Admin')

class AdminController {
    async index({ view }) {
        return view.render('modules.admins.index')
    }

    async fetchData({ response }) {
        const users = await User.query().orderBy('created_at', 'desc').fetch()
        return response.json({ data: users })
    }

    async create({ view }){
        return view.render('modules.admins.create')
    }

    async store({ response, request, session }) {
        const rules = {
            name: 'required',
            username: 'required|unique:admins,username',
            email: 'required|email|unique:admins,email',
            password: 'required|min:6|confirmed',
            status: 'required|integer'
        }
        const { name, username, email, password, status, password_confirmation } = request.only(['name', 'username', 'email', 'password', 'status', 'password_confirmation'])
        const validation = await validate({ name, username, status, email, password, password_confirmation }, rules)
        
        if (!validation.fails()) {
            try {
                const admin     = new User()
                admin.name      = name
                admin.username  = username
                admin.email     = email
                admin.password  = password
                admin.status    = status ? status : 1;
                
                await admin.save()

                session.flash({ success: 'You have been saved data!' })
                return response.redirect('/admin/admins')

            } catch (error) {
                session.flash({ error: 'You failed to saved data!, something gone wrong' })
                return response.redirect('/admin/admins')
            }
        } else {
            session.withErrors(validation.messages()).flashAll()
            return response.redirect('back')
        }
    }

    async edit({ params, view }) {
        const admin = await User.findOrFail(params.id)
        return view.render('modules.admins.edit', {admin: admin.toJSON()})
    }

    async update({ params, request, response, session }) {
        const rules = {
            name: 'required',
            username: 'required',
            email: 'required|email',
            password: 'required|min:6|confirmed',
            status: 'required|integer'
        }
        const { name, username, email, password, status, password_confirmation } = request.only(['name', 'username', 'email', 'password', 'status', 'password_confirmation'])
        const validation    = await validate({ name, username, status, email, password, password_confirmation }, rules)
        const admin         = await User.findOrFail(params.id)

        if (!validation.fails()) {
            try {
                admin.name      = name
                admin.username  = username
                admin.email     = email
                admin.password  = password
                admin.status    = status ? status : 1;
                
                await admin.save()

                session.flash({ success: 'You have been updated data!' })
                return response.redirect('/admin/admins')

            } catch (error) {
                session.flash({ error: 'You failed to updated data!, something gone wrong' })
                return response.redirect('/admin/admins')
            }
        } else {
            session.withErrors(validation.messages()).flashAll()
            return response.redirect('back')
        }
    }

    async delete({ params, response }){
        const admin = await User.findOrFail(params.id)

        try {
            admin.status = 3
            await admin.save()
            response.status(200).send({ status: 'success' })
        } catch (error) {
            response.status(500).send({ status: 'failed' })
        }
    }

}

module.exports = AdminController
