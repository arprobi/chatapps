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
/* 
	ADMIN MODULES
*/

/* Auth route */
Route.get('admin/login', 'Admin/AuthController.login').as('admin.login')
Route.post('admin/login', 'Admin/AuthController.handleLogin').as('admin.handleLogin')
Route.get('admin/logout', 'Admin/AuthController.logout').as('admin.logout')

Route.group(() => {
	/* Dasboard route */
    Route.get('/', 'Admin/DashboardController.index').as('admin.dashboard')

    /* Auth route */
    Route.get('profile', 'Admin/AuthController.profile').as('admin.profile')

	/* User route */
	Route.get('users', 'Admin/UserController.index').as('admin.users')
	Route.get('users/show/:id', 'Admin/UserController.show').as('admin.users.show')
	Route.get('users/:id/edit', 'Admin/UserController.edit').as('admin.users.edit')
	Route.post('users/:id/update', 'Admin/UserController.update').as('admin.users.update')
    // Route.get('users/import', 'Admin/UserController.importView').as('admin.users.importview')
    // Route.post('users/import', 'Admin/UserController.importData').as('admin.users.importdata')
    Route.get('users/fetch/:page', 'Admin/UserController.fetchData').as('admin.users.fetch')
    
    /* Admin route */
	Route.get('admins', 'Admin/AdminController.index').as('admin.admins')
	Route.get('admins/create', 'Admin/AdminController.create').as('admin.admins.create')
	Route.post('admins', 'Admin/AdminController.store').as('admin.admins.store')
	Route.get('admins/show/:id', 'Admin/AdminController.show').as('admin.admins.show')
	Route.get('admins/:id/edit', 'Admin/AdminController.edit').as('admin.admins.edit')
	Route.post('admins/:id/update', 'Admin/AdminController.update').as('admin.admins.update')
	Route.get('admins/:id/delete', 'Admin/AdminController.delete').as('admin.admins.delete')
	Route.get('admins/fetch/:page', 'Admin/AdminController.fetchData').as('admin.admins.fetch')

	/* Company route */
	Route.get('companies', 'Admin/CompanyController.index').as('admin.companies')
	Route.get('companies/show/:id', 'Admin/CompanyController.show').as('admin.companies.show')
	Route.get('companies/:id/edit', 'Admin/CompanyController.edit').as('admin.companies.edit')
	Route.post('companies/:id/update', 'Admin/CompanyController.update').as('admin.companies.update')
	Route.get('companies/fetch/data', 'Admin/CompanyController.fetchData').as('admin.companies.fetch')
	Route.get('companies/:id/delete', 'Admin/CompanyController.delete').as('admin.companies.delete')
	Route.get('companies/:id/setactive', 'Admin/CompanyController.setactive').as('admin.companies.setactive')
    
    /* Teams route */
	Route.get('teams', 'Admin/TeamController.index').as('admin.teams')
	Route.get('teams/show/:id', 'Admin/TeamController.show').as('admin.teams.show')
	Route.get('teams/:id/edit', 'Admin/TeamController.edit').as('admin.teams.edit')
	Route.post('teams/:id/update', 'Admin/TeamController.update').as('admin.teams.update')
	Route.get('teams/fetch/data', 'Admin/TeamController.fetchData').as('admin.teams.fetch')
	Route.get('teams/:id/delete', 'Admin/TeamController.delete').as('admin.teams.delete')

	/* Project route */
	Route.get('projects', 'Admin/ProjectController.index').as('admin.projects')
	Route.get('projects/show/:id', 'Admin/ProjectController.show').as('admin.projects.show')
	Route.get('projects/:id/edit', 'Admin/ProjectController.edit').as('admin.projects.edit')
	Route.put('projects/:id/update', 'Admin/ProjectController.update').as('admin.projects.update')
	Route.get('projects/fetch/data', 'Admin/ProjectController.fetchData').as('admin.projects.fetch')
	Route.get('projects/:id/delete', 'Admin/ProjectController.delete').as('admin.projects.delete')

}).prefix('admin').middleware(['admin'])
