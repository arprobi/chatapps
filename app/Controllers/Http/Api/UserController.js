'use strict'

const { validate } 	= use('Validator')
const Database 		= use('Database')
const Company 		= use('App/Models/Company')
const Marka 		= use('App/Models/Marka')
const Team 			= use('App/Models/Team')
const Project 		= use('App/Models/Project')
const User 			= use('App/Models/User')
const Mail 			= use('Mail')
const { randomString  } = use('App/Helpers/UtilsHelper')
const Encryption    = use('Encryption')

class UserController {
	constructor () {
        this.type = ['all', 'company', 'markas', 'team', 'project']
	}
	
	async all({ response }) {
		const users = await User.all()

		return response.json({
			status: 200,
			message: 'Users fetched!',
			data: users
		})
	}

	async detail({ params, response }) {
		const user = await User.findOrFail(params.id)

		return response.json({
			status: 200,
			message: 'User fetched!',
			data: user
		})
	}

	async search({ request, response, auth }) {
		const rules = {
			keyword: 'required|max:100',
			type: 'required|max:10',
			reference_id: 'integer'
		}
		
		const validation = await validate(request.only(['keyword', 'type', 'reference_id']), rules)
		if (validation.fails()) {
			return response.status(400).send(validation.messages())
		}

		const type = request.input('type', 'company')

		if (!this.type.includes(type)) {
            return response.status(200).send({
                status: 400,
                message: `Type of keyword is not match, use one of this : ['all', 'company', 'markas', 'team', 'project']!`,
            })
		}
		
		let data = []

		if (type === 'all') {
			data = await User.query()
							.where((builder) => {
								builder.where('email', 'ILIKE', `${request.input('keyword')}%`)
								.orWhere('username', 'ILIKE', `${request.input('keyword')}%`)
								.orWhere('name', 'ILIKE', `${request.input('keyword')}%`)
							}).whereNotIn('users.id', [auth.current.user.id])
							.fetch()
		}
		if (type === 'company') {
			const company 	= await Company.findOrFail(request.input('reference_id'))
			data = await company.users().where((builder) => {
										builder.where('email', 'ILIKE', `${request.input('keyword')}%`)
										.orWhere('username', 'ILIKE', `${request.input('keyword')}%`)
										.orWhere('name', 'ILIKE', `${request.input('keyword')}%`)
									}).whereNotIn('users.id', [auth.current.user.id])
									.fetch()
		}
		if (type === 'markas') {
			const markas = await Marka.findOrFail(request.input('reference_id'))
			data = await markas.users().where((builder) => {
										builder.where('email', 'ILIKE', `${request.input('keyword')}%`)
										.orWhere('username', 'ILIKE', `${request.input('keyword')}%`)
										.orWhere('name', 'ILIKE', `${request.input('keyword')}%`)
									}).whereNotIn('users.id', [auth.current.user.id])
									.fetch()
		}
		if (type === 'team') {
			const team 	= await Team.findOrFail(request.input('reference_id'))
			data = await team.users().where((builder) => {
										builder.where('email', 'ILIKE', `${request.input('keyword')}%`)
										.orWhere('username', 'ILIKE', `${request.input('keyword')}%`)
										.orWhere('name', 'ILIKE', `${request.input('keyword')}%`)
									}).whereNotIn('users.id', [auth.current.user.id])
									.fetch()
		}
		if (type === 'project') {
			const project 	= await Project.findOrFail(request.input('reference_id'))
			data = await project.users().where((builder) => {
										builder.where('email', 'ILIKE', `${request.input('keyword')}%`)
										.orWhere('username', 'ILIKE', `${request.input('keyword')}%`)
										.orWhere('name', 'ILIKE', `${request.input('keyword')}%`)
									}).whereNotIn('users.id', [auth.current.user.id])
									.fetch()
		}

		return response.json({
			status: 200,
			message: 'User fetched!',
			data: data
		})

	}

	async email({ request, response, auth }) {
		const to 	= request.input('to')
		const user 	= await User.findOrFail(auth.current.user.id)
		const from 	= 'bukapeta@noreply.com'

		try {
			await Mail.send('emails.welcome', user.toJSON(), (message) => {
				message
					.to(to)
					.from(from)
					.subject('Welcome message')
			})

			return 'Registered successfully'

		} catch (error) {
			return error
		}
	}

	async resetpassword ({ request, response }) {
		const emaillist = request.input('emaillist').split(',')

		for (let index = 0; index < emaillist.length; index++) {
			const mail 			= emaillist[index]
			
			const getuser 		= await User.findBy('email', mail)
			
			if (getuser) {
	
				const to 		= mail
				const from 		= 'kerja.tim.bukapeta@gmail.com'
					
				await Mail.send('emails.reset', { user: getuser.toJSON() }, (message) => {
					message
						.to(to)
						.from(from)
						.subject('Reset password User Kerja Team Application')
				})
			}
		}
	}

	async sendResetPassword({request, response}) {
		const rules = {
			email: 'email|required'
        }
        
		const email      = request.input('email')
		const validation = await validate({ email }, rules)
		
		if (!validation.fails()) {
			
			const user = await User.findBy('email', email)

			if (!user) {
				return response.status(200).send({
					status: 500,
					message: 'User not found!',
					data: []
				})
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
	
					return response.status(200).send({
						status: 200,
						message: 'Reset password link has been sent to your email!',
						data: user
					})
				} catch (error) {
					return response.status(200).send({
						status: 500,
						message: 'Internal serever error!',
						data: error
					})
				}
			}

		} else {
			return response.status(400).send(validation.messages())
		}
	}
}

module.exports = UserController
