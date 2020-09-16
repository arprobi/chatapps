'use strict'

const { validate }  	= use('Validator')
const Todo 	        	= use('App/Models/Todo')
const AssignTodo 	    = use('App/Models/AssignTodo')
const CommentTodo 	    = use('App/Models/CommentTodo')
const Notification  	= use('App/Models/Notification')
const FirebaseDevice    = use('App/Models/FirebaseDevice')
const { sendNotification, 
        generateMessage, 
        getUserTokenByCompany, 
        getUserTokenByMarkas, 
        getUserTokenByTeam, 
        getUserTokenByProject 
} = use('App/Services/FirebaseService')


class TodoController {
	constructor () {
        this.type       = ['company', 'markas', 'team', 'project']
        this.assigntype = ['assigner', 'assigned', 'tester']
        this.filepath   = '/home/middleware/files/uploads/'
	}
	
	async all ({ params, response }) {
		const type  = params.type
		const id    = params.id
		
		if (!this.type.includes(type)) {
            return response.status(404).send({
                status: 404,
                message: `URL not found!`,
            })
		}
		
		const todos = await Todo.query()
							.with('user')
							.with('childs', (query) => {
								query.orderBy('created_at', 'asc')
							})
							.with('assignto', (builder) => {
								builder.with('user')
							})
							.where('type', type)
							.where('reference_id', id)
							.where('parent_id', 0)
							.orderBy('created_at', 'asc')
							.fetch()
		
		return response.status(200).send({
			status: 200,
			message: `All todos ${type} fetched!`,
			data: todos
		})
	}

	async store ({ request, params, response, auth }) {
		const type  = params.type
		const id    = params.id
		
		if (!this.type.includes(type)) {
            return response.status(404).send({
                status: 404,
                message: `URL not found!`,
            })
		}

		const rules = {
			name: 'required|max:250',
			due_date: 'date',
			parent_id: 'integer',
			assigned: 'integer',
			tester: 'integer'
		}
		
		const validation    = await validate(request.only(['name', 'due_date', 'parent_id', 'assigned', 'tester']), rules)

		if (!validation.fails()) {
			try{
				const todo      	= new Todo()
				todo.name       	= request.input('name')
				todo.user_id 		= auth.current.user.id
				todo.parent_id  	= parseInt(request.input('parent_id', 0))
				todo.due_date   	= request.input('due_date')
				todo.is_done   		= request.input('is_done', false)
				todo.type   		= type
				todo.reference_id 	= parseInt(id)

				await todo.save()
				
				// save assigned & tester
				if (todo.parent_id === 0) {
					const { assigned, tester } = request.only(['assigned', 'tester'])
					let assignData = [{
						todo_id: todo.id,
						position: 'assigner',
						user_id: auth.current.user.id,
						status: 1
					}]

					if (assigned) {
						await assignData.push({
							todo_id: todo.id,
							position: 'assigned',
							user_id: assigned,
							status: 1
						})
					}
					if (tester) {
						await assignData.push({
							todo_id: todo.id,
							position: 'tester',
							user_id: tester,
							status: 1
						})
					}
					
					const assign = await AssignTodo.createMany(assignData)
					await Object.assign(todo, { assignto: assign })
					await Object.assign(todo, { user: auth.current.user })
				}

				// Get list token
				let tokens = []
				if (todo.type === 'markas') {
					tokens = await getUserTokenByMarkas(todo.reference_id)
				}
				if (todo.type === 'team') {
					tokens = await getUserTokenByTeam(todo.reference_id)
				}
				if (todo.type === 'projects') {
					tokens = await getUserTokenByProject(todo.reference_id)
				}
				
				if (tokens.length) {
					for(let key in tokens) {
						if (tokens[key]['user_id'] != auth.current.user.id) {
							const title 	= `New ${todo.type} todo`
							const body      = `${auth.current.user.name} created new todo in ${todo.type}`
							const message 	= await generateMessage(tokens[key]['firebase_token'], title, body, todo.type, 'todo', todo.reference_id)
							await sendNotification(message)
						}
					}
				}

				return response.status(200).send({
					status: 200,
					message: `Todo saved to ${ todo.type }!`,
					data: todo
				})

			} catch (error){
				return response.status(200).send({
					status: 500,
					message: 'Save todo failed!',
					data: error
				})
			}
		} else {
			return response.status(400).send(validation.messages())
		}
    }
    
    async update({ params, request, response, auth }) {
		const todo          = await Todo.findOrFail(params.id)
		
		const rules         = {
			name: 'required|max:250',
			assigned: 'integer',
			tester: 'integer'
        }
		
		const validation    = await validate(request.only(['name', 'assigned', 'tester']), rules)
		
		if (!validation.fails()) {
            try {
                todo.name = request.input('name', todo.name)
				await todo.save()
				
				// save assigned & tester
				if (todo.parent_id === 0) {
					const { assigned, tester } = request.only(['assigned', 'tester'])
					let assignData = []
					
					// reinput assign todo
					if (assigned) {
						await AssignTodo.query().where('todo_id', todo.id).where('position', 'assigned').delete()
						await assignData.push({
							todo_id: todo.id,
							position: 'assigned',
							user_id: assigned,
							status: 1
						})
					}
					if (tester) {
						await AssignTodo.query().where('todo_id', todo.id).where('position', 'tester').delete()
						await assignData.push({
							todo_id: todo.id,
							position: 'tester',
							user_id: tester,
							status: 1
						})
					}
					const user 		= await todo.user().fetch()
					const assign 	= await AssignTodo.createMany(assignData)
					await Object.assign(todo, { assignto: assign })
					await Object.assign(todo, { user: user })
				}

                return response.status(200).send({
					status: 200,
					message: 'Todo update!',
					data: todo
				})
            } catch (error) {
                return response.status(200).send({
					status: 500,
					message: 'Update todo failed!',
					data: error
				})
            }
        } else {
            return response.status(400).send(validation.messages())
        }
    }

	async setDone ({ params, response, auth }) {
        const todo      = await Todo.findOrFail(params.id)
        if (todo.parent_id === 0) {
            await Todo.query().where('parent_id', todo.id).update({ is_done: true })
        }
		todo.is_done    = true

		await todo.save()

		let tokens = []

		if (todo.type === 'markas') {
			tokens = await getUserTokenByMarkas(todo.reference_id)
		}
		if (todo.type === 'team') {
			tokens = await getUserTokenByTeam(todo.reference_id)
		}
		if (todo.type === 'projects') {
			tokens = await getUserTokenByProject(todo.reference_id)
		}
		
		if (tokens.length) {
			for(let key in tokens) {
				if (tokens[key]['user_id'] != user.id) {
					const title 	= `Done ${todo.type} todo`
					const body      = `${auth.current.user.name} set todo in ${todo.type} to done`
					const message 	= await generateMessage(tokens[key]['firebase_token'], title, body, todo.type, 'todo', todo.reference_id)
					anu.push(message)
					await sendNotification(message)
				}
			}
		}

		return response.status(200).send({
			status: 200,
			message: 'Todo done!',
			data: tokens
		})
	}

	async setUnDone ({ params, response, auth }) {
        const todo      = await Todo.findOrFail(params.id)
        if (todo.parent_id === 0) {
            await Todo.query().where('parent_id', todo.id).update({ is_done: false })
        }
		todo.is_done    = false

		await todo.save()

		let tokens = []

		if (todo.type === 'markas') {
			tokens = await getUserTokenByMarkas(todo.reference_id)
		}
		if (todo.type === 'team') {
			tokens = await getUserTokenByTeam(todo.reference_id)
		}
		if (todo.type === 'projects') {
			tokens = await getUserTokenByProject(todo.reference_id)
		}

		if (tokens.length) {
			for(let key in tokens) {
				if (tokens[key]['user_id'] != user.id) {
					const title 	= `Undone ${todo.type} todo`
					const body      = `${auth.current.user.name} set todo in ${todo.type} to undone`
					const message 	= await generateMessage(tokens[key]['firebase_token'], title, body, todo.type, 'todo', todo.reference_id)
					await sendNotification(message)
				}
			}
		}
		
		return response.status(200).send({
			status: 200,
			message: 'Todo undone!',
			data: todo
		})
	}

	async delete({ params, response, auth }) {		
		const todo = await Todo.findOrFail(params.id)
		
		try {
			await todo.assignto().delete()
			await todo.childs().delete()
			await todo.delete()
			let tokens = []

			if (todo.type === 'markas') {
				tokens = await getUserTokenByMarkas(todo.reference_id)
			}
			if (todo.type === 'team') {
				tokens = await getUserTokenByTeam(todo.reference_id)
			}
			if (todo.type === 'projects') {
				tokens = await getUserTokenByProject(todo.reference_id)
			}

			if (tokens.length) {
				for(let key in tokens) {
					if (tokens[key]['user_id'] != auth.current.user.id) {
						const title 	= `Deleted ${todo.type} todo`
						const body      = `${auth.current.user.name} deleted todo in ${todo.type}`
						const message 	= await generateMessage(tokens[key]['firebase_token'], title, body, todo.type, 'todo', todo.reference_id)
						await sendNotification(message)
					}
				}
			}

			return response.json({
				status: 200,
				message: 'Todo deleted!',
				data: todo
			})
		} catch (error) {
			return response.status(200).send({
				status: 500,
				message: 'Failed to delete todo, something wrong!',
				data: error
			})
		}
	}

	async listcomment({params, response}) {
		const todo = await Todo.findOrFail(params.id)

		const comments = await todo.comments().with('user').fetch()

		return response.json({
			status: 200,
			message: 'Fetch comment todo success!',
			data: comments
		})
	}

	async storecomment({ request, params, auth, response }) {
		const todo = await Todo.findOrFail(params.id)

		const rules         = {
			comment: 'required|max:250',
			parent_id: 'integer'
        }
		
		const validation    = await validate(request.only(['comment', 'parent_id']), rules)

		if (validation.fails()) {
			return response.status(400).send(validation.messages())
		}

		const comment 		= new CommentTodo()
		comment.user_id		= auth.current.user.id
		comment.todo_id		= todo.id
		comment.comment 	= request.input('comment')
		comment.parent_id 	= parseInt(request.input('parent_id'))

		try {
			await comment.save()
			
			await Object.assign(comment, { user: auth.current.user })
			
			return response.json({
				status: 200,
				message: 'Comment on todo success!',
				data: comment
			})
		} catch (error) {
			return response.status(200).send({
				status: 500,
				message: 'Failed to comment todo, something wrong!',
				data: error
			})
		}
	}

	async updatecomment({ request, params, auth, response }) {
		const todo 		= await Todo.findOrFail(params.id)
		const comment 	= await CommentTodo.findOrFail(params.comment_id)

		const rules         = {
			comment: 'max:250',
			parent_id: 'integer'
        }
		
		const validation    = await validate(request.only(['comment', 'parent_id']), rules)

		if (validation.fails()) {
			return response.status(400).send(validation.messages())
		}

		if (comment.user_id !== auth.current.user.id) {
			return response.status(403).send({
				status: 403,
				message: 'Not allowed',
				data: comment
			})
		}

		comment.comment 	= request.input('comment')
		comment.parent_id 	= parseInt(request.input('parent_id'))

		try {
			await comment.save()

			return response.json({
				status: 200,
				message: 'Update comment todo success!',
				data: comment
			})
		} catch (error) {
			return response.status(200).send({
				status: 500,
				message: 'Failed to comment todo, something wrong!',
				data: error
			})
		}
	}

	async deletecomment({params, request, response}) {
		const todo 		= await Todo.findOrFail(params.id)
		const comment 	= await CommentTodo.findOrFail(params.comment_id)

		if (comment.user_id !== auth.current.user.id) {
			return response.status(403).send({
				status: 403,
				message: 'Not allowed',
				data: comment
			})
		}

		try {
			await comment.delete()

			return response.json({
				status: 200,
				message: 'Delete comment todo success!',
				data: comment
			})
		} catch (error) {
			return response.status(200).send({
				status: 500,
				message: 'Failed to delte todo, something wrong!',
				data: error
			})
		}
	}
}

module.exports = TodoController
