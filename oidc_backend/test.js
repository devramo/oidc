const jwt = require('jsonwebtoken')
const { hashToken } = require('./utils')

const payload = {
  sub: 'djelassi',
  email: 'omar.djelassi@gmail.com',
  email_verified: true,
  loa: '3',
  nonce: 'req.query.nonce',
  at_hash: '7znBvFMGFDQB8nIbLTrbnA',
  exp: Math.floor(new Date().getTime() / 1000 + 60 * 60 * 24 * 365)
  /*,
    "aud": "foo",
    "exp": 315360000,
    "iat": Math.floor(new Date().getTime() / 1000),
    "iss": ISSUER */
}

const token = jwt.sign(payload, 'bar', { algorithm: 'HS256' })
console.log(token)

console.log(hashToken(token))
