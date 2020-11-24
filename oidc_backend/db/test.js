let db = require('diskdb')

db = db.connect('./db', ['clients', 'config', 'users'])
// const CONFIG = db.config.findOne()
// console.log(CONFIG)

// const client = db.clients.findOne({ client: 'foo' })
// console.log(client)

db.users.save({ username: 'djelassi', loa: 3 })
