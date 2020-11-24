const db = require('diskdb')

module.exports = db.connect('./db', ['clients', 'config', 'users'])
