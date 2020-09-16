'use strict'
const Company   = use('App/Models/Company')
const Team      = use('App/Models/Team')
const User      = use('App/Models/User')
const Mail      = use('Mail')
const Excel     = require('exceljs')
const { nameFromMail, randomString  } = use('App/Helpers/UtilsHelper')

class ImportService {
    static async ImportUserWithoutTeamId(filelocation, company_id) {

        const company     = await Company.findOrFail(company_id)

        const excel       = new Excel.Workbook()
        const workbook    = await excel.xlsx.readFile(filelocation)
        const explanation = workbook.getWorksheet('Sheet1') // get sheet name
        const colComment  = explanation.getColumn('A') //column name
        
        let team_id     = 0
        let team_name   = ''
        let data        = []

        colComment.eachCell(async (cell, rowNumber) => {
            if (rowNumber >= 1) {
                const teamname  = explanation.getCell('A' + rowNumber).value
                const name      = explanation.getCell('B' + rowNumber).value
                const email     = explanation.getCell('C' + rowNumber).value
                const password  = explanation.getCell('D' + rowNumber).value

                const user      = await new User()
                user.name       = name
                user.username   = await nameFromMail(email.text)
                user.email      = email.text
                user.password   = password

                // await user.save()
                
                if (teamname) {
                    // const team      = await new Team()
                    // team.name       = teamname
                    // team.user_id    = user.id
                    // team.company_id = company.id
                    // team.description= `Team created by ${user.email}`

                    // await team.save()

                    team_name = teamname
                }

                //custom field name in database to variable
                let inputUser = {
                    team: team_name,
                    name: name,
                    username: await nameFromMail(email.text),
                    email: email.text,
                    password: password
                }
                
                await data.push(inputUser)
            }
        })

        return data
    }

    static async ImportUserWithTeamId(filelocation, team_id) {

    }

    static async ImportUserReset(filelocation) {
        const excel       = new Excel.Workbook()
        const workbook    = await excel.xlsx.readFile(filelocation)
        const explanation = workbook.getWorksheet('Sheet1') // get sheet name
        const colComment  = explanation.getColumn('A') //column name
        let data     = []
        
        try {
            colComment.eachCell(async (cell, rowNumber) => {
                const email     = explanation.getCell('A' + rowNumber).value
                const newwpass  = await randomString()
                
                const getuser   = await User.query().where('email', email).first()
                const user      = await User.query().where('email', email.text).update({ password: newwpass})
                
                const to 		= email
                const from 		= 'bukapeta.dev@gmail.com'
                        
                await Mail.send('emails.reset', { user: getuser.toJSON(), random: newwpass }, (message) => {
                    message
                        .to(to)
                        .from(from)
                        .subject('Reset password User Kerja Team')
                })
            })
            return data
        } catch (error) {
            return `Error ${error}`
        }
        
    }
}

module.exports = ImportService