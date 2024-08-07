require('dotenv').config()

const Events = require('events')

const EventEmitter = new Events.EventEmitter()

const app = require('./src/app.js')

const Datasource = require('./src/frameworks/datasource')
Datasource(EventEmitter, false)

EventEmitter.emit('dbping')
EventEmitter.once('dbpong', app.start)
