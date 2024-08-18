require('dotenv').config()

const app = require('./src/app.js')

// const Events = require('events')
// const EventEmitter = new Events.EventEmitter()

// const Datasource = require('./src/frameworks/datasource')
// Datasource(EventEmitter, false)

// EventEmitter.emit('dbping')
// EventEmitter.once('dbpong', app.start)

app.start()
