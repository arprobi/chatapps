'use strict'

const { validate }  = use('Validator')
const Company       = use('App/Models/Company')

class CompanyController {
    async index({ view }) {
        return view.render('modules.companies.index')
    }

    async fetchData({ response }) {
        const companies = await Company.query().with('owner').orderBy('updated_at', 'desc').fetch()
        return response.json({ data: companies })
    }
    
    async show({ params, view }) {
        const company = await Company.query().with('owner').with('markas').where('id', params.id).first()
        return view.render('modules.companies.show', { company: company.toJSON() })
    }
    
    async edit({ params, response, view }) {
        const company = await Company.findOrFail(params.id)
        return view.render('modules.companies.edit', { company: company.toJSON() })
    }
    
    async update({ params, request, response, session }) {
        const company = await Company.findOrFail(params.id)
        const rules = {
            name: 'required',
            description: 'max:225',
            status: 'required|integer'
        }
        const { name, description, status } = request.only(['name', 'description', 'status'])
        const validation = await validate({ name, description, status }, rules)

        if (!validation.fails()) {
            try {
                company.name        = name
                company.description = description
                company.status      = status
                
                await company.save()

                session.flash({ success: 'You have been saved data!' })
                return response.redirect('/admin/companies')

            } catch (error) {
                session.flash({ error: 'You failed to saved data!, something gone wrong' })
                return response.redirect('/admin/companies')
            }
        } else {
            session.withErrors(validation.messages()).flashAll()
            return response.redirect('back')
        }
    }

    async delete({ params, response }){
        const company = await Company.findOrFail(params.id)

        try {
            company.status = 0
            await company.save()
            response.status(200).send({ status: 'success' })
        } catch (error) {
            response.status(500).send({ status: 'failed' })
        }
    }

    async setactive({ params, response }) {
        const company = await Company.findOrFail(params.id)
        company.status = company.status === 1 ? 0 : 1
        
        try {
            await company.save()
            response.status(200).send({ status: 'success' })
        } catch (error) {
            response.status(500).send({ status: 'failed' })
        }
    }
    
}

module.exports = CompanyController
