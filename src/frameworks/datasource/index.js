const Postgres = require('./postgres')

module.exports = (EventEmitter, keepConnectionAlive = true) => {
  const Db = new Postgres(EventEmitter)
  if (keepConnectionAlive) {
    EventEmitter.emit('connectdb')
    EventEmitter.once('dbconnected', () => {
      Db.Sync(
        process.env.DB_MIGRATIONS_FORCESYNC == 'true',
        process.env.DB_MIGRATIONS_FORCEALTER == 'true'
      )
    })
  }
  return Db
}
