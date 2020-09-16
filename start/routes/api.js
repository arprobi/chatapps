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


const Route = use('Route')
const Helpers = use('Helpers')

Route.on('/').render('welcome')
Route.on('/docs').render('docs')

Route.get('websocket', ({view}) => {
	return view.render('socket.websocket')
})
Route.get('websocket2', ({view}) => {
	return view.render('socket.websocket2')
})

Route.get('api/v1', () => {
	return { greeting: 'Welcome to middleware API' }
})

Route.post('api/v1/login', 'Api/AuthController.login')
Route.post('api/v1/register', 'Api/AuthController.register')
Route.get('api/v1/logout', 'Api/AuthController.logout')

Route.group(() => {
	/* Auth route */
	Route.get('profile', 'Api/AuthController.profile')
	Route.post('profile', 'Api/AuthController.update')
	Route.post('refresh', 'Api/AuthController.refreshToken')

	/* Users route */
	Route.get('user', 'Api/UserController.all')
	Route.get('user/detail/:id', 'Api/UserController.detail')
	Route.post('user/search', 'Api/UserController.search')
	Route.post('user/email', 'Api/UserController.email')
	Route.post('user/resetpassword', 'Api/UserController.sendResetPassword')

	/* Notification route */
	Route.get('notification', 'Api/NotificationController.all')
	Route.get('notification/:id/read', 'Api/NotificationController.read')
	Route.delete('notification/:id', 'Api/NotificationController.delete')

	/* Companies route */
	Route.get('company', 'Api/CompanyController.all')
	Route.post('company/create', 'Api/CompanyController.store')
	Route.get('company/:id', 'Api/CompanyController.detail')
	Route.post('company/:id/update', 'Api/CompanyController.update')
	Route.delete('company/:id', 'Api/CompanyController.delete')
	Route.get('company/:id/listuser', 'Api/CompanyController.listUser')
	Route.post('company/:id/adduser', 'Api/CompanyController.addUser')
	Route.post('company/:id/removeuser', 'Api/CompanyController.removeUser')
	Route.post('company/:id/addadmin', 'Api/CompanyController.addAdmin')
	Route.post('company/:id/removeadmin', 'Api/CompanyController.removeAdmin')

	/* Markas route */
	Route.get('markas/:id/list', 'Api/MarkasController.all')
	Route.get('markas/:id/detail', 'Api/MarkasController.detail')
	Route.get('markas/listuser/:company_id', 'Api/MarkasController.listuser')
	Route.put('markas/update/:id', 'Api/MarkasController.update')

	/* Teams route */
	Route.get('team/:company_id/list', 'Api/TeamController.all')
	Route.post('team/:company_id/create', 'Api/TeamController.store')
	Route.get('team/:id/detail', 'Api/TeamController.detail')
	Route.post('team/:id/update', 'Api/TeamController.update')
	Route.delete('team/:id', 'Api/TeamController.delete')
	Route.get('team/:id/listuser', 'Api/TeamController.listUser')
	Route.post('team/:id/adduser', 'Api/TeamController.addUser')
	Route.post('team/:id/removeuser', 'Api/TeamController.removeUser')

	/* Projects route */
	Route.get('project/:company_id/list', 'Api/ProjectController.all')
	Route.post('project/:company_id/create', 'Api/ProjectController.store')
	Route.get('project/:id/detail', 'Api/ProjectController.detail')
	Route.post('project/:id/update', 'Api/ProjectController.update')
	Route.delete('project/:id', 'Api/ProjectController.delete')
	Route.get('project/:id/listuser', 'Api/ProjectController.listUser')
	Route.post('project/:id/adduser', 'Api/ProjectController.addUser')
	Route.post('project/:id/removeuser', 'Api/ProjectController.removeUser')

	/* Todos route */
	Route.get('todos/:type/:id/all', 'Api/TodoController.all')
	Route.post('todos/:type/:id/create', 'Api/TodoController.store')
	Route.put('todos/:id/update', 'Api/TodoController.update')
	Route.delete('todos/:id/delete', 'Api/TodoController.delete')
	Route.get('todos/:id/done', 'Api/TodoController.setDone')
	Route.get('todos/:id/undone', 'Api/TodoController.setUnDone')

	/* Todos comment */
	Route.get('todos/:id/comment', 'Api/TodoController.listcomment')
	Route.post('todos/:id/comment', 'Api/TodoController.storecomment')
	Route.put('todos/:id/comment/:comment_id/update', 'Api/TodoController.updatecomment')

	/* Chat route */
	Route.get('chats/:type/:id/list', 'Api/ChatController.all')
	Route.post('chats/:type/:id/create', 'Api/ChatController.store')
	Route.delete('chats/:id', 'Api/ChatController.delete')

	/* File route */
	Route.get('files/:type/:id/list', 'Api/FileController.all')
	Route.post('files/:type/:id/upload', 'Api/FileController.uploadfile')
	Route.get('files/detail/:id', 'Api/FileController.detail')
	Route.delete('files/delete/:id', 'Api/FileController.delete')
	Route.get('files/comments/:id', 'Api/FileController.getcomment')
	Route.post('files/comments/:id', 'Api/FileController.postcomment')
	Route.delete('files/comments/:id', 'Api/FileController.deletecomment')

	/* Firebase Messaging */
	Route.post('firebase/addtoken', 'Api/FirebaseController.save')
	Route.post('firebase/deletetoken', 'Api/FirebaseController.delete')
	Route.post('firebase/sendmessage', 'Api/FirebaseController.sendMessage')

	/* Event */ 
	Route.post('events/:type/:id/all', 'Api/EventController.all')
	Route.post('events/:type/:id/bydate', 'Api/EventController.bydate')
	Route.get('events/:id/detail', 'Api/EventController.detail')
	Route.post('events/:type/:id/create', 'Api/EventController.store')
	Route.put('events/:id/update', 'Api/EventController.update')
	Route.delete('events/:id/delete', 'Api/EventController.delete')

	/* Thread */ 
	Route.get('threads/:type/:id/all', 'Api/ThreadController.all')
	Route.post('threads/:type/:id/create', 'Api/ThreadController.store')
	Route.put('threads/:type/:id/update', 'Api/ThreadController.update')
	Route.delete('threads/:type/:id/delete', 'Api/ThreadController.delete')

	/* Personal Chat */
	Route.get('mychat', 'Api/PersonalChatController.mychat')
	Route.get('mychat/with/:user_id', 'Api/PersonalChatController.detail')
	Route.post('mychat/with/:user_id/create', 'Api/PersonalChatController.store')

	/* Status */
	Route.get('status/:id', 'Api/StatusController.all')
	Route.post('status/:id/create', 'Api/StatusController.store')
	Route.put('status/:id/update', 'Api/StatusController.update')
	Route.delete('status/:id/delete', 'Api/StatusController.delete')

}).prefix('api/v1').middleware(['auth:jwt'])
