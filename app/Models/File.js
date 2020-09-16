'use strict'

const Model = use('Model')
const User  = use('App/Models/User')
const { sendNotification, generateMessage, getUserTokenByProject } = use('App/Helpers/FirebaseHelper')

class File extends Model {
    static boot () {
        super.boot()

        // this.addHook('afterSave', async (fileInstance) => {
        //     if (fileInstance.type != 99) {
        //         const listtoken     = await getUserTokenByProject(fileInstance.project_id)
        //         const user          = await User.findOrFail(fileInstance.user_id)
        //         for(let key in listtoken) {
        //             if (listtoken[key]['user_id'] != fileInstance.user_id) {
        //                 const title 	= `New file attached`
        //                 const body		= `${user.name} added new file!`
        //                 const message 	= await generateMessage(listtoken[key]['firebase_token'], title, body, 'file', fileInstance.id, 'high')
        //                 await sendNotification(message)
        //             }
        //         }
        //     }
        // })
    }

    static get computed () {
        return ['file_url']
    }

    /**
     * A Getter 
     * @return {String}
    */
    getFileUrl({name, extension}) {
        if (extension === 'link') {
            return name
        } else {
            return `https://files.kerja.team/uploads/${name}.${extension}`
        }
    }

    /**
     * A relationship 
     * @return {Object}
    */
    user () {
        return this.belongsTo('App/Models/User')
    }

    comments () {
        return this.hasMany('App/Models/FileComment')
    }
}

module.exports = File
