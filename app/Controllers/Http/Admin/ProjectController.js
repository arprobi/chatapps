'use strict'

const Project   = use('App/Models/Project')
const Todo      = use('App/Models/Todo')

class ProjectController {
    async index({ request, response, view }) {
        return view.render('modules.projects.index')
    }
    
    async fetchData({ response }) {
        const projects  = await Project.query().with('owner').with('company').orderBy('created_at', 'desc').fetch()

        return response.json({ data: projects })
    }

    async show({ params, view }) {
        let project = await Project.query().with('owner').with('todos', (query) => {
            query.with('childs').where('parent_id', 0).orderBy('created_at').fetch()
        }).where('id', params.id).first()

        const todos 	= await Todo.query().where('project_id', params.id).where('parent_id', '>', 0).getCount()
		const done 		= await Todo.query().where('project_id', params.id).where('parent_id', '>', 0).where('is_done', true).getCount()
        let progress 	= 0
        
        if (done > 0) {
            progress 	= await (done/todos)*100
        }

		await Object.assign(project, {progress: progress})
        
        return view.render('modules.projects.show', { project: project.toJSON() })
    }

    async edit({ params, view }) {
        const project = await Project.findOrFail(params.id)
        return view.render('modules.projects.edit', { project: project.toJSON() })
    }

    async delete({ params, response }){
        const project = await Project.findOrFail(params.id)

        try {
            project.status = 0
            await project.save()
            response.status(200).send({ status: 'success' })
        } catch (error) {
            response.status(500).send({ status: 'failed' })
        }
    }
}

module.exports = ProjectController
