'use strict'

class StaticController {
    async privacy({ view }) {
        return view.render('web.static.privacy')
    }
}

module.exports = StaticController
