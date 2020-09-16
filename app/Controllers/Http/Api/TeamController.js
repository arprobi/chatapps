'use strict'

const Company       = use('App/Models/Company')
const CompanyRole   = use('App/Models/CompanyRole')
const Database      = use('Database')
const Mail 			= use('Mail')
const Project       = use('App/Models/Project')
const Team          = use('App/Models/Team')
const User       	= use('App/Models/User')
const { validate }  = use('Validator')
const Notification  = use('App/Models/Notification')
const { nameFromMail, randomString  } = use('App/Helpers/UtilsHelper')

class TeamController {
	async all ({ response, auth, params }) {
		const company 	= await Company.findOrFail(params.company_id)

		if (company.status === 0) {
			return response.status(200).send({
				status: 200,
				message: 'Teams fetched!',
				data: []
			})
		}

		const user 		= await User.findOrFail(auth.current.user.id)
		const teams 	= await user.teams().where('company_id', params.company_id).fetch()
		

		return response.status(200).send({
			status: 200,
			message: 'Teams fetched!',
			data: teams
		})
	}

	async store ({ request, response, auth, params }) {
		const company = await Company.findOrFail(params.company_id)

		const rules = {
			name: 'required|max:250',
			company_id: 'integer',
			description: 'max:254',
			status: 'integer',
		}
		
		const validation = await validate(request.only(['name', 'description', 'company_id', 'status']), rules)

		if (!validation.fails()) {
			try{
				const team 		 = new Team()
				team.name 		 = request.input('name')
				team.user_id 	 = auth.current.user.id
				team.company_id	 = company.id
				team.description = request.input('description')
				team.status 	 = parseInt(request.input('status', 0))
		
				await team.save()

				const user 	 = await User.findOrFail(auth.current.user.id)
				await user.teams().attach([team.id])

				if (request.input('users')) {
					const users = await request.input('users').split(',')
					await team.users().attach(users)
				}
				
				return response.status(200).send({
					status: 200,
					message: 'Team saved!',
					data: team
				})
			} catch {
				return response.status(200).send({
					status: 500,
					message: 'Save team failed!'
				})
			}
		} else {
			return response.status(400).send(validation.messages())
		}
	}

	async detail({ params, response }) {
		const team = await Team.query().with('owner').with('users').where('id', params.id).first()

		return response.json({
			status: 200,
			message: 'Team fetched!',
			data: team
		})
	}
	
	async update({ response, request, params }) {
		const team = await Team.findOrFail(params.id)

		const rules = {
			name: 'required|max:250',
			description: 'max:254',
			status: 'integer',
		}
		
		const validation = await validate(request.only(['name', 'description', 'status']), rules)

		if (!validation.fails()) {
			try {
				team.name 		 = request.input('name', team.name)
				team.logo        = request.input('logo', team.logo)
				team.description = request.input('description', team.description)
				team.status 	 = parseInt(request.input('status', team.status))

				await team.save()
				
				return response.status(200).send({
					status: 200,
					message: 'Team updated!',
					data: team
				})

			} catch (err) {
				return response.status(200).send({ error: 'Failed to update team, something wrong' })
			}
		} else {
			return response.status(400).send(validation.messages())
		}
	}
	
	async delete({ params, response, auth }) {
		const team 		= await Team.findOrFail(params.id)
		const company   = await Company.findOrFail(team.company_id)
		
		// if not owner company
		if (auth.current.user.id != company.user_id) {
			const isadmin = await CompanyRole.query().where('user_id', auth.current.user.id).where('company_id', company.id).getCount()
			// if not admin company
			if (isadmin < 1) {
				return response.json({
					status: 403,
					message: 'You are not allowed to delete team!'
				})
			}
		}

		try {
			// Delete team user relation first
			await Database.table('user_teams').where('team_id', team.id).delete()
			// Delete team
			await team.delete()
			
			return response.json({
				status: 200,
				message: 'Team deleted!',
				data: team
			})
		} catch {
			return response.status(200).send({
				status: 500,
				message: 'Failed to delete team, something wrong!',
				data: team
			})
		}
	}
	
	async listUser({ params, response }) {
		const team = await Team.findOrFail(params.id)
		const users= await team.users().fetch()

		return response.json({
			status: 200,
			message: 'User fetched!',
			data: users
		})
	}
	
	async addUser({ auth, params, request, response }) {
		const team      = await Team.findOrFail(params.id)
		const company   = await Company.findOrFail(team.company_id)
	
		const rules 	= {
			user_id: 'integer',
			email: 'string|email'
		}
		
		const validation= await validate(request.only(['user_id', 'email']), rules)
		const email 	= request.input('email')

		if(validation.fails()) {
			return response.status(400).send(validation.messages())
		}
		
		// Check is user registered or not yet
		if (email) {
			// User not registered
			const checkuser = await User.findBy('email', email)
			
			if (checkuser) {
				return response.json({
					status: 200,
					message: 'User already exist!',
					data: checkuser
				})
			} else {
				try {
					const uname		= await nameFromMail(email)
					const random	= await randomString()
					const newuser	= new User()
					newuser.name 	= uname
					newuser.email	= email
					newuser.password= random
					newuser.username= uname
					newuser.status	= 1

					await newuser.save()
					await team.users().attach([newuser.id])
					await company.users().attach([newuser.id])

					const listUser 	= await Team.query().where('id', params.id).with('users').fetch()
					const user 		= await User.find(newuser.id)
					const pengundang= await User.find(auth.current.user.id)

					const to 		= email
					const from 		= 'bukapeta@noreply.com'
					await Mail.send('emails.invite', { company: company.toJSON(), team: team.toJSON(), user: user.toJSON(), pengundang: pengundang.toJSON(), random: random }, (message) => {
						message
							.to(to)
							.from(from)
							.subject('Invitation message')
					})
					
					return response.json({
						status: 200,
						message: 'New user created and added to team!',
						data: listUser
					})

				} catch (error) {
					return response.status(200).send({
						status: 500,
						message: error
					})
				}
			}
		} else {
			// User registered
			try{
				const check = await team.users().where('user_id', request.input('user_id')).getCount()
				if(check >= 1){
					const listUser = await Team.query().where('id', params.id).with('users').fetch()

					return response.json({
						status: 200,
						message: 'User recently added to team!',
						data: listUser
					})
				} else {
					const checkCompany  = await company.users().where('user_id', request.input('user_id')).getCount()
					// Add user company by team
					if (checkCompany < 1) {
						await company.users().attach([request.input('user_id')])
					}
					
					await team.users().attach([request.input('user_id')])
					
					const listUser 	= await Team.query().where('id', params.id).with('users').fetch()
					
					const notif     	= new Notification()
					notif.user_id   	= request.input('user_id')
					notif.title     	= `You are added to ${team.name} team`
					notif.message   	= `${auth.current.user.name} add you to join team ${team.name} in ${company.name}`
					notif.read      	= 0
					notif.type          = 'team'
					notif.subtype       = 'discuss'
					notif.reference_to  = team.id	
					notif.status    	= 1

					await notif.save()

					return response.json({
						status: 200,
						message: 'User added to team!',
						data: listUser
					})
				}

			} catch {
				return response.status(200).send({
					status: 500,
					message: 'Failed to add user to team, something wrong!'
				})
			}
		}

		
	}

	async removeUser({ auth, params, request, response }) {
		const team      = await Team.findOrFail(params.id)
		const company   = await Company.findOrFail(team.company_id)
		const rules = {
			user_id: 'integer'
		}

		const validation = await validate(request.only(['user_id']), rules)

		if(!validation.fails()) {
			try{
				await team.users().detach([request.input('user_id')])
				// await company.users().detach([request.input('user_id')])

				const listUser = await Team.query().where('id', params.id).with('users').fetch()
				
				const notif     	= new Notification()
				notif.user_id   	= request.input('user_id')
				notif.title     	= `You are removed from ${team.name} team`
				notif.message   	= `${auth.current.user.name} remove you from ${team.name} in ${company.name}`
				notif.read      	= 0
				notif.type          = 'team'
				notif.subtype       = 'discuss'
				notif.reference_to  = team.id
				notif.status    	= 1

				return response.json({
					status: 200,
					message: 'User removed from team!',
					data: listUser
				})

			} catch {
				response.status(200).send({
					status: 500,
					message: 'Failed to add user to team, something wrong!'
				})
			}
		} else {
			return response.status(400).send(validation.messages())
		}
	}
}

module.exports = TeamController
