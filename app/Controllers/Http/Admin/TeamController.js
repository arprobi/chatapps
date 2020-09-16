'use strict'

const { validate }  = use('Validator')
const Project 		= use('App/Models/Project')
const Company 		= use('App/Models/Company')
const Team 		    = use('App/Models/Team')
const Todo 		    = use('App/Models/Todo')


class TeamController {
    async index({ request, response, view }) {
        return view.render('modules.teams.index')
    }

    async fetchData({ response }) {
        const teams  = await Team.query().with('owner').with('company').orderBy('created_at', 'desc').fetch()

        return response.json({ data: teams })
    }

    async show({ params, view }) {
        let team = await Team.query().with('owner').with('company').with('projects', (query) => {
            query.orderBy('created_at').fetch()
        }).where('id', params.id).first()
        
        return view.render('modules.teams.show', { team: team.toJSON() })
    }

    async edit({ params, view }) {
        const team = await Team.findOrFail(params.id)
        return view.render('modules.teams.edit', { team: team.toJSON() })
    }

    async update({ params, request, response, session }) {
        const team = await Team.findOrFail(params.id)
        const rules = {
            name: 'required',
            description: 'max:225',
            status: 'required|integer'
        }
        const { name, description, status } = request.only(['name', 'description', 'status'])
        const validation = await validate({ name, description, status }, rules)

        if (!validation.fails()) {
            try {
                team.name        = name
                team.description = description
                team.status      = status
                
                await team.save()

                session.flash({ success: 'You have been saved data!' })
                return response.redirect('/admin/teams')

            } catch (error) {
                session.flash({ error: 'You failed to saved data!, something gone wrong' })
                return response.redirect('/admin/teams')
            }
        } else {
            session.withErrors(validation.messages()).flashAll()
            return response.redirect('back')
        }
    }

    async delete({ params, response }){
        const team = await Team.findOrFail(params.id)

        try {
            team.status = 0
            await team.save()
            response.status(200).send({ status: 'success' })
        } catch (error) {
            response.status(500).send({ status: 'failed' })
        }
    }
}

module.exports = TeamController
