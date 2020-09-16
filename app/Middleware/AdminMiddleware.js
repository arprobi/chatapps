'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

class AdminMiddlware {
    /**
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Function} next
     */
    async handle ({ response, auth }, next) {
        if(!auth.user){
            return response.redirect('/admin/login')
        }

        await next()
    }
}

module.exports = AdminMiddlware