'use strict'

const { validate }  = use('Validator')
const Database      = use('Database')
const Company       = use('App/Models/Company')
const Marka         = use('App/Models/Marka')
const CompanyRole   = use('App/Models/CompanyRole')
const FirebaseDevice= use('App/Models/FirebaseDevice')
const User          = use('App/Models/User')
const Notification  = use('App/Models/Notification')

class CompanyController {
    async all ({ response, auth }) {
		const user      = await User.findOrFail(auth.current.user.id)
        const companies = await user.companies().with('owner').fetch()

		return response.status(200).send({
			status: 200,
			message: 'Companies fetched!',
			data: companies
		})
    }

    async store ({ request, response, auth }) {
		const rules = {
			name: 'required|max:250',
			description: 'max:254',
			status: 'integer',
		}
        const validation = await validate(request.only(['name', 'description', 'status']), rules)
        const user       = await User.findOrFail(auth.current.user.id)

		if (!validation.fails()) {
			try{
                // Craete company
				const company 		= new Company()
				company.name 		= request.input('name')
				company.user_id 	= auth.current.user.id
				company.logo        = request.input('logo')
				company.description = request.input('description')
				company.status 	    = parseInt(request.input('status', 1))

                await company.save()

                // Craete markas
                const markas 		= new Marka()
				markas.name 		= company.name
                markas.company_id 	= company.id
                
                await markas.save()
                
                await user.companies().attach([company.id])
                await user.markas().attach([markas.id])

                const newcompany    = await Company.query().with('markas').where('id', company.id).fetch()
				
				return response.status(200).send({
					status: 200,
					message: 'Company saved!',
					data: newcompany
				})
			} catch {
				return response.status(200).send({
					status: 500,
					message: 'Save company failed!'
				})
			}
		} else {
			response.status(400).send(validation.messages())
		}
    }

    async detail({ params, response }) {
        const company = await Company.query()
                                .with('users')
                                .with('owner')
                                .where('id', params.id)
                                .first()

        return response.json({
            status: 200,
            message: 'Company fetched!',
            data: company
        })
    }

    async update({ response, request, params, auth }) {
        const company = await Company.findOrFail(params.id)

        if (auth.current.user.id !== company.user_id) {
            return response.status(200).send({
                status: 403,
                message: 'You are not allowed to delete this company!'
            })
        }

        const rules = {
			name: 'required|max:250',
			description: 'max:254',
			status: 'integer',
		}
        
        const validation = await validate(request.only(['name', 'description', 'status']), rules)

        if (!validation.fails()) {
            try {
                company.name 		= request.input('name', company.name)
				company.logo        = request.input('logo', company.logo)
				company.description = request.input('description', company.description)
				company.status 	    = parseInt(request.input('status', company.status))

                await company.save()
				
				return response.status(200).send({
					status: 200,
					message: 'Company updated!',
					data: company
				})

            } catch (err) {
                return response.status(200).send({ error: 'Failed to update company, something wrong' })
            }
        } else {
            return response.status(400).send(validation.messages())
        }
    }

    async delete({ params, response, auth }) {
        const company = await Company.findOrFail(params.id)
        
        if (auth.current.user.id !== company.user_id) {
            return response.status(200).send({
                status: 403,
                message: 'You are not allowed to delete this company!'
            })
        }

        try {
            // Delete company user relation first
            await Database.table('user_companies').where('company_id', company.id).delete()
            
            // Delete company relation first
            await company.markas().delete()
            await company.teams().delete()
            await company.projects().delete()

            // Delete company
            await company.delete()
            
            return response.json({
                status: 200,
                message: 'Company deleted!',
                data: company
            })
        } catch {
            return response.status(200).send({
                status: 500,
                message: 'Failed to delete company, something wrong!',
            })
        }
    }

    async listUser({ params, response }) {
        const company   = await Company.findOrFail(params.id)
        const listUser  = await company.users().fetch()
        return response.json({
            status: 200,
            message: 'User fetched!',
            data: listUser
        })
    }

    async addAdmin ({ auth, params, request, response }) {
        const company = await Company.findOrFail(params.id)
        const markas  = await Marka.findBy('company_id', company.id)

        if (auth.current.user.id !== company.user_id) {
            return response.status(200).send({
                status: 403,
                message: 'You are not allowed to add admin this company!'
            })
        }

        const rules = {
			user_id: 'required|integer'
        }
        const validation    = await validate(request.only(['user_id']), rules)
        const user 			= await company.users().where('user_id', request.input('user_id')).first()
        const adminexist    = await company.roles().where('user_id', request.input('user_id')).first()
		
		if (!user) {
			return response.json({
				status: 200,
				message: 'User is not exist in this company!'
			})
        }

        if (adminexist) {
            return response.json({
				status: 200,
				message: 'User is already admin in this company!'
			})
        }
        
        if (!validation.fails()) {
            if(auth.current.user.id != company.user_id) {
                return response.json({
                    status: 200,
                    message: 'You are not allowed to add admin!'
                })
            } else {
                const role 		= new CompanyRole()
				role.user_id	= user.id
				role.company_id	= company.id
				role.code		= 1
				
                await role.save()

                // Save Notification
                const notif         = new Notification()
                notif.user_id       = user.id
                notif.title         = `You are now admin in ${company.name}`
                notif.message       = `You are added as admin of ${company.name} by ${auth.current.user.name}`
                notif.read          = 0
                notif.type          = 'markas'
                notif.subtype       = 'discuss'
                notif.reference_to  = markas.id
                notif.status        = 1

                await notif.save()
                
                const listadmin = await company.roles().fetch()

				return response.json({
					status: 200,
					message: 'Data saved!',
					data: listadmin
				})
            }
        } else {
            return response.status(400).send(validation.messages())
        }
    }

    async removeAdmin({ auth, params, request, response }) {
        const company = await Company.findOrFail(params.id)
        const markas  = await Marka.findBy('company_id', company.id)

        if (auth.current.user.id !== company.user_id) {
            return response.status(200).send({
                status: 403,
                message: 'You are not allowed to remove admin this company!'
            })
        }

        const rules = {
			user_id: 'required|integer'
        }
        const adminexist    = await company.roles().where('user_id', request.input('user_id')).first()
        const validation    = await validate(request.only(['user_id']), rules)

        if (!adminexist) {
            return response.json({
				status: 200,
				message: 'User is already remove from admin!'
			})
        }

        if (!validation.fails()) {
            if(auth.current.user.id != company.user_id) {
                return response.json({
                    status: 200,
                    message: 'You are not allowed to remove admin!'
                })
            } else {
                await CompanyRole.query().where('company_id', company.id).where('user_id', request.input('user_id')).delete()
                
                const listadmin = await company.roles().fetch()

                const notif         = new Notification()
                notif.user_id       = request.input('user_id')
                notif.title         = `You are removed as admin in ${company.name}`
                notif.message       = `Now you are not an admin of ${company.name}, removed by ${auth.current.user.name}`
                notif.read          = 0
                notif.type          = 'markas'
                notif.subtype       = 'discuss'
                notif.reference_to  = markas.id
                notif.status        = 1

                await notif.save()

				return response.json({
					status: 200,
					message: 'Data saved!',
					data: listadmin
				})
            }
        } else {
            return response.status(400).send(validation.messages())
        }
    }

    async addUser({ params, request, response, auth }) {
        const company = await Company.findOrFail(params.id)
        const markas  = await Marka.findBy('company_id', company.id)
        const rules = {
			user_id: 'integer'
        }
        
        const validation = await validate(request.only(['user_id']), rules)

        if (company.user_id != auth.current.user.id) {
            return response.status(200).send({
                status: 403,
                message: 'You are not allowed to invite user to this company!'
            })
        }

        if(!validation.fails()) {
            try{
                const user  = await User.findOrFail(request.input('user_id'))
                const exist = await user.markas().getCount()
                
                if(exist > 0){
                    const listUser = await Marka.query().where('company_id', params.id).with('users').fetch()
                    return response.json({
                        status: 200,
                        message: 'User recently added to company!',
                        data: listUser
                    })
                } else {
                    await markas.users().attach([request.input('user_id')])

                    const check = await company.users().where('user_id', request.input('user_id')).getCount()
                    if (check < 1) {
                        await company.users().attach([request.input('user_id')])
                    }

                    const listUser = await Marka.query().where('company_id', params.id).with('users').fetch()

                    const notif         = new Notification()
                    notif.user_id       = request.input('user_id')
                    notif.title         = `You are added to ${company.name}`
                    notif.message       = `${auth.current.user.name} invite you to join ${company.name}`
                    notif.read          = 0
                    notif.type          = 'markas'
                    notif.subtype       = 'discuss'
                    notif.reference_to  = markas.id
                    notif.status        = 1

                    await notif.save()
    
                    return response.json({
                        status: 200,
                        message: 'User added to company!',
                        data: listUser
                    })
                }

            } catch (error) {
                return response.status(200).send({
                    status: 500,
                    message: 'Failed to add user to company, something wrong!',
                    data: error
                })
            }
        } else {
            return response.status(400).send(validation.messages())
        }
    }

    async removeUser({ params, request, response, auth }) {
        const company = await Company.findOrFail(params.id)
        const markas  = await Marka.findBy('company_id', company.id)
        const rules = {
			user_id: 'integer'
        }
        
        const validation = await validate(request.only(['user_id']), rules)

        if (company.user_id != auth.current.user.id) {
            return response.status(200).send({
                status: 403,
                message: 'You are not allowed to remove user from this company!'
            })
        }

        if(!validation.fails()) {
            try{
                await markas.users().detach([request.input('user_id')])
                // await company.users().detach([request.input('user_id')])
                const listUser = await Marka.query().where('company_id', params.id).with('users').fetch()

                const notif        = new Notification()
                notif.user_id      = request.input('user_id')
                notif.title        = `You removed from ${company.name}`
                notif.message      = `You are removed from ${company.name} by ${auth.current.user.name}, you are no longer member of this company`
                notif.read         = 0
                notif.type         = 'markas'
                notif.subtype      = 'discuss'
                notif.reference_to = markas.id
                notif.status       = 1

                await notif.save()

                return response.json({
                    status: 200,
                    message: 'User removed from company!',
                    data: listUser
                })

            } catch {
                return response.status(200).send({
                    status: 500,
                    message: 'Failed to remove user user company, something wrong!'
                })
            }
        } else {
            return response.status(400).send(validation.messages())
        }
    }
}

module.exports = CompanyController
