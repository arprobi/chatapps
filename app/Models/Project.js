'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const moment    = require('moment')
const tzmoment  = require('moment-timezone')
const Model     = use('Model')

class Project extends Model {

    static boot() {
        super.boot()

        // this.addHook('afterSave', async(projectInstance) => {
        //     if (projectInstance.due_date != null) {
        //         const check = await Schedule.query().where('project_id', projectInstance.id).getCount()
        //         if (check > 0) {
        //             await Schedule.query()
        //                 .where('project_id', projectInstance.id)
        //                 .update({ 
        //                     title       : projectInstance.project_name,
        //                     description : projectInstance.project_description,
        //                     start_date  : tzmoment.tz(projectInstance.start_date, 'Asia/Jakarta'),
        //                     end_date    : tzmoment.tz(projectInstance.due_date, 'Asia/Jakarta'),
        //                 })
        //         } else {
        //             const team          = await Team.findOrFail(projectInstance.team_id)
        //             const schedule      = new Schedule()
        //             schedule.user_id    = team.user_id
        //             schedule.company_id = team.company_id
        //             schedule.project_id = projectInstance.id
        //             schedule.title      = projectInstance.project_name
        //             schedule.description= projectInstance.project_description
        //             schedule.type       = 1
        //             schedule.start_date = tzmoment.tz(projectInstance.start_date, 'Asia/Jakarta')
        //             schedule.end_date   = tzmoment.tz(projectInstance.due_date, 'Asia/Jakarta')
    
        //             await schedule.save()
        //         }
        //     }
            
        // })
    }

    static get computed () {
        return ['str_status']
    }

    static get dates () {
        return super.dates.concat(['start_date', 'due_date'])
    }
    /**
     * A Getter 
     * @return {String}
    */
    getStrStatus({status}) {
        if (status === 0) {
            return 'inactive'
        } else {
            return 'active'
        }
    }

    /**
     * A relationship 
     * @return {Object}
    */
    company () {
        return this.belongsTo('App/Models/Company')
    }

    owner () {
        return this.belongsTo('App/Models/User')
    }

    users () {
        return this.belongsToMany('App/Models/User').pivotTable('user_projects').withTimestamps()
    }

}

module.exports = Project
