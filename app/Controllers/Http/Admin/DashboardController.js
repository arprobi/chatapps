'use strict'

const Company   = use('App/Models/Company')
const Project   = use('App/Models/Project')
const Team      = use('App/Models/Team')
const User      = use('App/Models/User')

class DashboardController {
    async index({ request, response, view }) {
        const users     = await User.query().getCount()
        const company   = await Company.query().getCount()
        const project   = await Project.query().getCount()
        const team      = await Team.query().getCount()

        return view.render('modules.dashboard.index', { 
            members: users, 
            companies: company, 
            projects: project,
            teams: team
        })
	}
}

module.exports = DashboardController
