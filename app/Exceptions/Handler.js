'use strict'

const BaseExceptionHandler = use('BaseExceptionHandler')

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
    /**
        * Handle exception thrown during the HTTP lifecycle
        *
        * @method handle
        *
        * @param  {Object} error
        * @param  {Object} options.request
        * @param  {Object} options.response
        *
        * @return {void}
    */
    async handle (error, { request, response, view }) {
        if (error.code === 'E_INVALID_JWT_TOKEN' || error.code === 'E_USER_NOT_FOUND') {
            return response.status(401).send('Invalid credentials')
        }

        if (error.code === 'E_ROUTE_NOT_FOUND') {
            return response.status(404).send('URL Not Found!')
        }
        
        response.status(error.status).send(error.message)
    }

    /**
    * Report exception for logging or debugging.
    *
    * @method report
    *
    * @param  {Object} error
    * @param  {Object} options.request
    *
    * @return {void}
    */
    async report (error, { request }) {
    }
}

module.exports = ExceptionHandler
