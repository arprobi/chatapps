'use strict'

const Task      = use('Task')
const Schedule  = use('App/Models/Schedule')

class Event extends Task {
  static get schedule () {
    return '* * * * *'
  }

  async handle () {
    this.info('Task Event handle')
  }
}

module.exports = Event
