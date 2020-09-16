'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */


const Route     = use('Route')
const Helpers   = use('Helpers')

Route.get('privacy-policy', 'Web/StaticController.privacy').as('web.privacy')

Route.get('activation/:encrypted', 'Web/UserController.activation').as('web.activation')

Route.get('resetpassword/email', 'Web/PasswordController.findmail').as('web.findmail')
Route.post('resetpassword/email', 'Web/PasswordController.handlemail').as('web.findmail.post')
Route.get('resetpassword/:encrypted', 'Web/PasswordController.reset').as('web.resetpassword')
Route.post('resetpassword/reset', 'Web/PasswordController.handlereset').as('web.resetpassword.post')