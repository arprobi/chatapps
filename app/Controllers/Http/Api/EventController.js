'use strict'

const moment      	= require('moment')
const tzmoment      = require('moment-timezone')
const { validate }  = use('Validator')
const Event 	    = use('App/Models/Event')
const { sendNotification, 
    generateMessage, 
    getUserTokenByCompany, 
    getUserTokenByMarkas, 
    getUserTokenByTeam, 
    getUserTokenByProject 
} = use('App/Services/FirebaseService')

class EventController {
    constructor () {
        this.type       = ['company', 'markas', 'team', 'project']
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
		
        const events = await Event.query().with('user').where('type', type).where('reference_id', id).orderBy('created_at', 'asc').fetch()
		
		return response.status(200).send({
			status: 200,
			message: `All events ${type} fetched!`,
			data: events
		})
    }
    
    async bydate ({ params, request, response }) {
		const type  = params.type
		const id    = params.id
		
		if (!this.type.includes(type)) {
            return response.status(404).send({
                status: 404,
                message: `URL not found!`,
            })
        }
        
        const date  = new Date()
        let next    = new Date(new Date().setDate(date.getDate()+30));
        let last    = new Date(new Date().setDate(date.getDate()-30));

        next = tzmoment.tz(`${next.getFullYear()}-${(next.getMonth()+1)}-${next.getDate()}`, 'Asia/Jakarta')
        last = tzmoment.tz(`${last.getFullYear()}-${(last.getMonth()+1)}-${last.getDate()}`, 'Asia/Jakarta')

        const company_id    = request.input('company_id')
        const from          = moment(request.input('fromdate', last)).format('YYYY-MM-DD HH:mm:ss')
        const to            = moment(request.input('todate', next)).add(1, 'day').format('YYYY-MM-DD HH:mm:ss')
		
        const events = await Event.query()
                                    .whereBetween('start_date', [from, to])
                                    .with('user')
                                    .where('type', type)
                                    .where('reference_id', id)
                                    .orderBy('created_at', 'asc')
                                    .fetch()
		
		return response.status(200).send({
			status: 200,
			message: `All events ${type} fetched bydate!`,
			data: events
		})
    }
    
    async detail({ params, request, response }) {
        const event = await Event.query().where('id', params.id).with('user').first()

        return response.status(200).send({
            status: 200,
            message: 'Fetch event detail success!',
            data: event
        })
    }

    async store({ params, request, response, auth }) {
        const type  = params.type
		const id    = params.id
		
		if (!this.type.includes(type)) {
            return response.status(404).send({
                status: 404,
                message: `URL not found!`,
            })
        }

        const rules = {
			title: 'required|max:150',
            description: 'required|max:254',
			start_date: 'date',
			end_date: 'date',
        }
        
        const validation = await validate(request.only(['title', 'description', 'start_date', 'end_date']), rules)

        if (!validation.fails()) {
            try {
                const event          = new Event()
				event.title          = request.input('title')
                event.user_id        = auth.current.user.id
				event.description    = request.input('description')
				event.event          = request.input('event', 'general')
				event.type           = type
				event.start_date     = tzmoment(request.input('start_date', await new Date())).format('YYYY-MM-DD HH:mm:ss')
                event.end_date       = tzmoment(request.input('end_date', await new Date())).format('YYYY-MM-DD HH:mm:ss')
				event.reference_id   = parseInt(id)
                
                await event.save()

                await Object.assign(event, {user: auth.current.user})

                let tokens = []
				if (type === 'markas') {
					tokens = await getUserTokenByMarkas(event.reference_id)
				}
				if (type === 'team') {
					tokens = await getUserTokenByTeam(event.reference_id)
				}
				if (type === 'projects') {
					tokens = await getUserTokenByProject(event.reference_id)
				}
				
				if (tokens.length) {
					for(let key in tokens) {
						if (tokens[key]['user_id'] != auth.current.user.id) {
							const title 	= `New ${event.type} event`
							const body      = `${auth.current.user.name} created new event in ${event.type}`
							const message 	= await generateMessage(tokens[key]['firebase_token'], title, body, event.type, 'event', event.reference_id)
							await sendNotification(message)
						}
					}
				}

                return response.json({
                    status: 200,
                    message: `Event ${type} created!`,
                    data: event
                })

            } catch (error) {
                return response.json({
                    status: 200,
                    message: `Failed to create event in! ${type}`,
                    data: error
                })
            }
        } else {
            return response.status(400).send(validation.messages())
        }
    }

    async update({ params, request, response, auth }) {
        const event = await Event.findOrFail(params.id)

        const rules = {
			title: 'required|max:150',
            description: 'max:254',
			start_date: 'date',
			end_date: 'date',
        }
        
        const validation = await validate(request.only(['title', 'description', 'start_date', 'end_date']), rules)

        if (!validation.fails()) {
            try {
				event.title          = request.input('title', event.title)
				event.description    = request.input('description', event.description)
				event.start_date     = tzmoment(request.input('start_date', event.start_date)).format('YYYY-MM-DD HH:mm:ss')
                event.end_date       = tzmoment(request.input('end_date', event.end_date)).format('YYYY-MM-DD HH:mm:ss')
                
                await event.save()

                let tokens = []
				if (event.type === 'markas') {
					tokens = await getUserTokenByMarkas(event.reference_id)
				}
				if (event.type === 'team') {
					tokens = await getUserTokenByTeam(event.reference_id)
				}
				if (event.type === 'projects') {
					tokens = await getUserTokenByProject(event.reference_id)
				}
				
				if (tokens.length) {
					for(let key in tokens) {
						if (tokens[key]['user_id'] != auth.current.user.id) {
							const title 	= `Event ${event.type} update`
							const body      = `${auth.current.user.name} update new event in ${event.type}`
							const message 	= await generateMessage(tokens[key]['firebase_token'], title, body, event.type, 'event', event.reference_id)
							await sendNotification(message)
						}
					}
				}

                await Object.assign(event, {user: auth.current.user})

                return response.json({
                    status: 200,
                    message: `Event ${event.type} updated!`,
                    data: event
                })

            } catch (error) {
                return response.json({
                    status: 200,
                    message: `Failed to create event in! ${event.type}`,
                    data: error
                })
            }
        } else {
            return response.status(400).send(validation.messages())
        }
    }

    async delete ({ params, response }) {
        const event = await Event.findOrFail(params.id)

        try {
            await event.delete()

            let tokens = []

            if (event.type === 'markas') {
                tokens = await getUserTokenByMarkas(event.reference_id)
            }
            if (event.type === 'team') {
                tokens = await getUserTokenByTeam(event.reference_id)
            }
            if (event.type === 'projects') {
                tokens = await getUserTokenByProject(event.reference_id)
            }
            
            if (tokens.length) {
                for(let key in tokens) {
                    if (tokens[key]['user_id'] != user.id) {
                        const title 	= `Event ${event.type} deleted`
                        const body      = `${auth.current.user.name} deleted ${event.type} from event list`
                        const message 	= await generateMessage(tokens[key]['firebase_token'], title, body, event.type, 'event', event.reference_id)
                        anu.push(message)
                        await sendNotification(message)
                    }
                }
            }

            return response.json({
                status: 200,
                message: `Event has been deleted!`,
                data: event
            })
        } catch (error) {
            return response.json({
                status: 200,
                message: `Failed to create event in! ${type}`,
                data: error
            })
        }
    }
}

module.exports = EventController
