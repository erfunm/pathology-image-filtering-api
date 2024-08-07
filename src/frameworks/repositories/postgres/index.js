const Events = require('events')
const EventEmitter = new Events.EventEmitter()

const Datasource = require('../../datasource')
const Db = Datasource(EventEmitter)

const userRepository = require('./user.repository')(Db)

module.exports = Object.freeze({
  userRepository
})
