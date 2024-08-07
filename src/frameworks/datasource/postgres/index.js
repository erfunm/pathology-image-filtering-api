const PostgresAdapter = require('./adapter')
const Schemas = require('./schemas')

module.exports = class DB extends PostgresAdapter {
  constructor (EventEmitter) {
    super()
    this.totalModelsCreated = 0
    this.status = 'disconnected'
    this.events = EventEmitter
    EventEmitter.on('dbping', () => {
      this.ConnectionPing()
    })
    EventEmitter.on('connectdb', () => {
      this.Connect()
    })
    EventEmitter.on('disconnectdb', () => {
      this.Disconnect()
    })
  }

  get Status() {
    return this.status
  }

  AdapterHook(action, value = null) {
    switch (action) {
      case 'connection':
        this.status = 'connected'
        this.events.emit('dbconnected', this.DB)
        // console.log("database connection has been established successfully.");
        break
      case 'dbdisconnected':
        this.status = 'disconnected'
        this.events.emit('dbdisconnected')
        console.log('database connection closed.')
        break
      case 'dbpong':
        this.events.emit('dbpong')
        break
      case 'synced':
        this.events.emit('dbsynced')
        break
    }
  }

  get Models() {
    return {
      Users: Schemas.users
    }
  }

  async getUser(cond = {}) {
    for (const key in cond) {
      if (cond[key] instanceof Object) {
        const { op = 'eq', value } = cond[key]
        cond[key] = {
          [this.Op[op]]: value
        }
      }
    }
    return await this.GetModel('Users').FindOne(cond)
  }

}
