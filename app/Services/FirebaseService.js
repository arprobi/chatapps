'use strict'

const axios      = require('axios')
const Database   = use('Database')


const sendNotification = async (message) => {
    const serverkey = 'AAAASbSRaZg:APA91bGKvKVRXlwV8mzZkY-NE_adb4fF_TneMQTnfdRGvYVfkGz2wQv7HmMNHZA5PJKbzAkbehthN-e3xoHeAgiRec7vaihrzVCpY4_gdemD-OtJYVFiTA39dsbja5kiddqa2LPWAC07'
    
    const fcmurl    = 'https://fcm.googleapis.com/fcm/send'
    
    const headers   = {
        'Content-Type': 'application/json',
        'Authorization': `key=${serverkey}`
    }

    await axios.post(fcmurl, message, {headers: headers}).then((res) => {
        return 'Send message success!' 
    }).catch((err) => {
        return err
    })
    
}

const getUserTokenByCompany = async (id) => {
    const userlist  = await Database.table('user_companies').where('company_id', id).pluck('user_id')
    const tokenlist = await Database.table('firebase_devices').whereIn('user_id', userlist)
    return tokenlist
}

const getUserTokenByMarkas = async (id) => {
    const userlist  = await Database.table('user_markas').where('marka_id', id).pluck('user_id')
    const tokenlist = await Database.table('firebase_devices').whereIn('user_id', userlist)
    return tokenlist
}

const getUserTokenByTeam = async (id) => {
    const userlist  = await Database.table('user_teams').where('team_id', id).pluck('user_id')
    const tokenlist = await Database.table('firebase_devices').whereIn('user_id', userlist)
    return tokenlist
}

const getUserTokenByProject = async (id) => {
    const userlist  = await Database.table('user_projects').where('project_id', id).pluck('user_id')
    const tokenlist = await Database.table('firebase_devices').whereIn('user_id', userlist)
    return tokenlist
}


const generateMessage = async (token='', title='', body='', type='general', subtype='general', reference_id=0) => {
    const message = {
        'to' : token,
        'collapse_key'  : `${type}_${subtype}`,
        'priority'      : 'high',
        'data'          : {
            'title'   	    : title,
            'body'    	    : body,
            'type'          : type, // ['general', 'markas', 'team', 'project', 'personal']
            'subtype'       : subtype, // ['discuss', 'todo', 'event', 'file', 'thread', 'status', 'personal']
            'reference_id'  : reference_id, // // id each type
            'sound'         : 'default'
        }
    }

    return message
}

module.exports = {
    sendNotification,
    getUserTokenByCompany,
    getUserTokenByMarkas,
    getUserTokenByTeam,
    getUserTokenByProject,
    generateMessage
}