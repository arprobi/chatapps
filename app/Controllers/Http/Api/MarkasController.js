'use strict'

const tzmoment      = require('moment-timezone')
const moment        = require('moment');
const { validate }  = use('Validator')
const Database      = use('Database')
const Company       = use('App/Models/Company')
const Marka         = use('App/Models/Marka')

class MarkasController {
    /* Markas */
    async all ({ params, response, auth }) {
        const company = await Company.findOrFail(params.id)

        if (company.status === 0) {
			return response.status(200).send({
				status: 200,
				message: 'Teams fetched!',
				data: []
			})
        }
        
        const users   = await Database.from('user_companies').where('company_id', company.id).pluck('user_id')
        const markas  = await Marka.query().with('company').where('company_id', company.id).fetch()

        if (!users.includes(auth.current.user.id)) {
            return response.json({
                status: 403,
                message: 'You are not member of this markas!',
                data: company
            })
        }

        return response.json({
            status: 200,
            message: 'List markas fetched!',
            data: markas
        })
    }

    async detail({ params, response }) {
        const markas = await Marka.query().with('users').with('company').where('id', params.id).fetch()

        return response.json({
            status: 200,
            message: 'Detail markas fetched!',
            data: markas
        })
    }

    async listuser ({ params, response, auth }) {
        const company_id = params.company_id
        const company    = await Company.findOrFail(company_id)
        const markas     = await Marka.query().where('company_id', company.id).first()
        const listuser   = await markas.users().fetch()

        let users        = []

        const listadmin  = await Database.table('company_roles').where('company_id', company.id).pluck('user_id')

        for(let key in listuser) {
            let item = listuser[key]
            for (var prop in item) {
                if(item.hasOwnProperty(prop)){
                    if (listadmin.includes(item[prop]['id'])) {
                        await users.push(await Object.assign(item[prop], {is_admin: true}))
                    } else {
                        await users.push(await Object.assign(item[prop], {is_admin: false}))
                    }
                }
            }
        }

        return response.json({
            status: 200,
            message: 'List markas user fetched!',
            data: users
        })
    }

    async update ({ params, request, response }) {
        const markas = await Marka.findOrFail(params.id)
        markas.name  = request.input('name', markas.name)

        try {
            await markas.save()

            return response.json({
                status: 200,
                message: 'Markas update success!',
                data: markas
            })
        } catch (error) {
            return response.status(200).json({
                status: 500,
                message: 'Update markas failed!',
                data: markas
            })
        }
    }

    async generate ({ params, request, response }) {
        const user_companies    = await Database.table('user_companies')
        let user_markas         = []
        
        for(let key in user_companies) {
            let item = user_companies[key]
            
            const markas = await Marka.findBy('company_id', item.company_id)
            await user_markas.push({
                user_id: item.user_id,
                marka_id: markas.id
            })
        }

        const insert = await Database.table('user_markas').insert(user_markas)
        return insert
    }

}

module.exports = MarkasController
