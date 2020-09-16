'use strict'

const { validate }  = use('Validator')
const Database 		= use('Database')
const Mail 			= use('Mail')
const Company 		= use('App/Models/Company')
const CompanyRole 	= use('App/Models/CompanyRole')
const Project 		= use('App/Models/Project')
const Todo 		    = use('App/Models/Todo')
const User 		    = use('App/Models/User')
const Notification  = use('App/Models/Notification')
const { nameFromMail, randomString  } 		 = use('App/Helpers/UtilsHelper')

class ProjectController {
	async all ({ auth, response, params }) {		
		const company 	= await Company.findOrFail(params.company_id)
		if (company.status === 0) {
			return response.status(200).send({
				status: 200,
				message: 'Projects fetched!',
				data: []
			})
		}

		const user 	  	= await User.findOrFail(auth.current.user.id)
		const projects  = await user.projects().where('company_id', company.id).orderBy('due_date', 'desc').fetch()
		
        let data = []
		
        for(let key in projects) {
            let item = projects[key]
            for (var prop in item) {
                if(item.hasOwnProperty(prop)){
                    // get progress from todo model
                    let alltodos    = await Todo.query().where('type', 'project').where('reference_id', item[prop]['id']).where('parent_id', '>', 0).getCount()
                    let isdone      = await Todo.query().where('type', 'project').where('reference_id', item[prop]['id']).where('parent_id', '>', 0).where('is_done', true).getCount()
                    let progress    = 0
                    if (isdone > 0) {
                        progress    = await parseFloat(Number((isdone/alltodos) * 100).toFixed(2))
                    }
                    
					// push to data
					await data.push(await Object.assign(item[prop], {progress: progress}))
                }
            }
        }

		return response.status(200).send({
			status: 200,
			message: 'Projects fetched!',
			data: data 
		})
	}

	async store ({ request, response, params, auth }) {
		const company = await Company.findOrFail(params.company_id)
		
		const rules = {
			project_name: 'required|max:250',
			project_description: 'max:254',
			start_date: 'date',
			due_date: 'date',
			status: 'integer',
		}

		const validation = await validate(request.only(['project_name', 'project_description', 'start_date', 'due_date', 'status']), rules)

		if (!validation.fails()) {
			try{
				const project 		        = new Project()
				project.project_name 		= request.input('project_name')
				project.user_id 	        = auth.current.user.id
				project.company_id 	        = company.id
				project.project_description = request.input('project_description')
				project.project_logo        = request.input('project_logo')
				project.start_date          = request.input('start_date', null)
				project.due_date 		    = request.input('due_date', null)
				project.status 	            = parseInt(request.input('status', 1))

				await project.save()
                
				await Object.assign(project, {progress: 0})
				
				const user 	 = await User.findOrFail(auth.current.user.id)
				await user.projects().attach([project.id])

				if (request.input('users')) {
					const users = await request.input('users').split(',')
					await project.users().attach(users)
				}
                
				return response.json({
					status: 200,
					message: 'Project saved!',
					data: project
				})
			} catch (error) {
				return response.status(200).send({
					status: 500,
					message: 'Save project failed!',
					data: error
				})
			}
		} else {
			return response.status(400).send(validation.messages())
		}
	}
	
	async detail({ params, response }) {
		let project 	= await Project.query()
								.with('users')
								.with('owner')
								.where('id', params.id)
								.first()

		const todos 	= await Todo.query().where('type', 'project').where('reference_id', params.id).where('parent_id', '>', 0).getCount()
		const done 		= await Todo.query().where('type', 'project').where('reference_id', params.id).where('parent_id', '>', 0).where('is_done', true).getCount()
        let progress 	= 0.00
        
        if (done > 0) {
            progress 	= await parseFloat(((done/todos) * 100).toFixed(2))
        }

		await Object.assign(project, {progress: progress})

		return response.json({
			status: 200,
			message: 'Project fetched!',
			data: project
		})
	}

	async update({ response, request, params }) {
		let project = await Project.findOrFail(params.id)

		const rules = {
			project_name: 'max:250',
			project_description: 'max:254',
			status: 'integer',
			start_date: 'date',
			due_date: 'date',
			status: 'integer',
			team_id: 'integer'
		}
		
		const validation = await validate(request.only(['project_name', 'project_description', 'start_date', 'due_date', 'status']), rules)

		if (!validation.fails()) {
			try {
                const todos 	= await Todo.query().where('type', 'project').where('reference_id', params.id).where('parent_id', '>', 0).getCount()
				const done 		= await Todo.query().where('type', 'project').where('reference_id', params.id).where('parent_id', '>', 0).where('is_done', true).getCount()
                let progress    = 0
                
                if (done > 0) {
                    progress 	= await (done/todos)*100
                }
                
				project.project_name 		= request.input('project_name', project.project_name)
				project.project_description = request.input('project_description', project.project_description)
				project.project_logo 		= request.input('project_logo', project.project_logo)
				project.status 	            = parseInt(request.input('status', project.status))
				project.start_date          = request.input('start_date', project.start_date)
				project.due_date 		    = request.input('due_date', project.due_date)
                
				await project.save()
                
                await Object.assign(project, {progress: progress})
				
				return response.status(200).send({
					status: 200,
					message: 'Project updated!',
					data: project
				})

			} catch (err) {
				return response.status(200).send({ error: 'Failed to update project, something wrong' })
			}
		} else {
			return response.status(400).send(validation.messages())
		}
	}

	async delete({ params, response, auth }) {
		const project = await Project.findOrFail(params.id)
		const company = await Company.findOrFail(project.company_id)

		// Only company owner, project owner and admin can delete
		if (auth.current.user.id != company.user_id) {
			if (auth.current.user.id != project.user_id) {
				const isadmin = await CompanyRole.query().where('user_id', auth.current.user.id).where('company_id', company.id).getCount()
				if (isadmin < 1) {
					return response.json({
						status: 403,
						message: 'You are not allowed to remove this project!'
					})
				}
			}
		}

		try {
			await Todo.query().where('type', 'project').where('reference_id', project.id).delete()
			await Database.table('user_projects').where('project_id', project.id).delete()
			await project.delete()

			return response.json({
				status: 200,
				message: 'Project deleted!',
				data: project
			})
		} catch {
			return response.status(200).send({
				status: 500,
				message: 'Failed to delete project, something wrong!',
				data: project
			})
		}
	}

	async listUser({ params, response }) {
		const project 	= await Project.findOrFail(params.id)
		const users		= await project.users().fetch()

		return response.json({
			status: 200,
			message: 'User fetched!',
			data: users
		})
	}

	async addUser({ auth, params, request, response }) {
		const project   = await Project.findOrFail(params.id)
		const company   = await Company.findOrFail(project.company_id)
	
		const rules 	= {
			user_id: 'integer',
			email: 'string|email'
		}
		
		const validation= await validate(request.only(['user_id','email']), rules)
		const email 	= request.input('email')
		
		if(validation.fails()) {
			return response.status(400).send(validation.messages())
		}

		// Check is user registered or not yet
		if (email) {
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
					await project.users().attach([newuser.id])
					await company.users().attach([newuser.id])

					const listUser 	= await Project.query().where('id', params.id).with('users').fetch()
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
				const check = await project.users().where('user_id', request.input('user_id')).getCount()
				if(check >= 1){
					const listUser = await project.users().fetch()
					return response.json({
						status: 200,
						message: 'User recently added to team!',
						data: listUser
					})
				} else {
					await project.users().attach([request.input('user_id')])
					const checkCompany  = await company.users().where('user_id', request.input('user_id')).getCount()
					// Add user company by team
					if (checkCompany < 1) {
						await company.users().attach([request.input('user_id')])
					}
					
					const listUser 	= await project.users().fetch()

					const notif     	= new Notification()
					notif.user_id   	= request.input('user_id')
					notif.title     	= `You added to ${company.name} project`
					notif.message   	= `${auth.current.user.name} add you to join project ${project.project_name} in ${company.name}`
					notif.read      	= 0
					notif.type          = 'project'
					notif.subtype       = 'discuss'
					notif.reference_to  = project.id
					notif.status    	= 1

					await notif.save()

					return response.json({
						status: 200,
						message: 'User added to project!',
						data: listUser
					})
				}

			} catch (error) {
				return response.status(200).send({
					status: 500,
					message: 'Failed to add user to project, something wrong!',
					data: error
				})
			}
		}
	}

	async removeUser({ auth, params, request, response }) {
		const project   = await Project.findOrFail(params.id)
		const company   = await Company.findOrFail(project.company_id)
		
		const rules = {
			user_id: 'integer'
		}

		const validation = await validate(request.only(['user_id']), rules)

		if(!validation.fails()) {
			try{
				await project.users().detach([request.input('user_id')])
				// await company.users().detach([request.input('user_id')])

				const listUser = await Project.query().where('id', params.id).with('users').fetch()

				const notif     	= new Notification()
				notif.user_id   	= request.input('user_id')
				notif.title     	= `You removed from ${project.project_name} project`
				notif.message   	= `${auth.current.user.name} remove you from ${project.project_name} project in ${company.name}`
				notif.read      	= 0
				notif.type          = 'project'
				notif.subtype       = 'discuss'
				notif.reference_to  = project.id
				notif.status    	= 1

				await notif.save()
				
				return response.json({
					status: 200,
					message: 'User removed from project!',
					data: listUser
				})

			} catch {
				response.status(200).send({
					status: 500,
					message: 'Failed to add user to project, something wrong!'
				})
			}
		} else {
			return response.status(400).send(validation.messages())
		}
	}
}

module.exports = ProjectController
