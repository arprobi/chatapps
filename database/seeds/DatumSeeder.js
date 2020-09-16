'use strict'

/*
|--------------------------------------------------------------------------
| DatumSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory 	 = use('Factory')
const Discussion = use('App/Models/Discussion')
const Company 	 = use('App/Models/Company')
const Project 	 = use('App/Models/Project')
const Todo 		   = use('App/Models/Todo')
const User 		   = use('App/Models/User')
const Team 		   = use('App/Models/Team')


class DatumSeeder {
  async run () {
    // Create Administrator
    const admin    = new Admin()
    admin.id       = 1
    admin.name     = 'Superadmin'
    admin.username = 'superadmin'
    admin.email    = 'superadmin@mail.com'
    admin.password = 'superadmin'
    admin.status   = 1
    await admin.save()
    
  	// Create user
  	// const user    = new User()
    // user.id       = 1
    // user.name     = 'Lorem Ipsum'
    // user.username = 'loremipsum'
    // user.email    = 'abc@email.com'
    // user.password = '123456'
    // user.status   = 1
    // await user.save()

    // //Create company
    // const company       = new Company()
    // company.id          = 1
    // company.name        = 'PT Bukabapak'
    // company.user_id     = 1
    // company.logo        = 'https://s1.bukalapak.com/img/6066730223/w-1000/textgram_1536808754.png'
    // company.description = 'Company testing for API'
    // company.status 		  = 1
    // await company.save()

    // //Create team
    // const team       = new Team()
    // team.id          = 1
    // team.name        = 'Mobile'
    // team.user_id     = 1
    // team.company_id     = 1
    // team.description = 'Mobile apps team'
    // team.status 		  = 1
    // await team.save()

    // //Create project
    // const project    	    = new Project()
    // project.id            = 1
    // project.project_name  = 'Buka Peta'
    // project.user_id       = 1
    // project.team_id       = 1
    // project.project_logo  = 'http://cdn2.tstatic.net/banjarmasin/foto/bank/images/avriellya-shaqila.jpg'
    // project.project_description = 'Middleware Project Development'
    // project.status 		    = 1
    // await project.save()

    // // Create todos
    // const todo 		= new Todo()
    // todo.id    		= 1
    // todo.name    	= 'Auth module'
    // todo.project_id = 1
    // todo.is_done 	= 0
    // todo.parent_id 	= 0
    // await todo.save()

    // const todo2 	= new Todo()
    // todo2.id    	= 2
    // todo2.name    	= 'Login API'
    // todo2.project_id= 1
    // todo2.is_done 	= 0
    // todo2.parent_id = 1
    // await todo2.save()

    // const todo3 	= new Todo()
    // todo3.id    	= 3
    // todo3.name    	= 'Register API'
    // todo3.project_id= 1
    // todo3.is_done 	= 0
    // todo3.parent_id = 1
    // await todo3.save()

    // // Create discuss
    // const disscuss 		= new Discussion()
    // disscuss.type    	= 1
    // disscuss.message    = 'Halo teman-teman'
    // disscuss.user_id 	= 1
    // disscuss.project_id = 1
    // await disscuss.save()
  }
}

module.exports = DatumSeeder
