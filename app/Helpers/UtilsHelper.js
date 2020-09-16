'use strict'


const nameFromMail = async (email) => {
    const string = email.substring(0, email.indexOf("@"))
    return string.replace(/[^a-zA-Z ]/g, "")    
}

const randomString = async () => {
    return Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
}

const mentionRegex = async (string) => {
    const regex     = /\s([@][\w_-]+)/g
    const mentioned = await string.match(regex)
    
    let result      = []
    if (mentioned) {
        for (let index = 0; index < mentioned.length; index++) {
            const element = mentioned[index].replace('@', '')
            if (!result.includes(element.replace(/\s/g,''))) {
                await result.push(element.replace(/\s/g,''))
            }
        }
    
        return result
    }
    return result
}

module.exports = {
    nameFromMail,
    randomString,
    mentionRegex
}