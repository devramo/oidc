const { createHash } = require('crypto')
const { base64url, bufferFromBase64 } = require('./base64')

const hashToken = (token) => {
  const digest = createHash('sha256').update(token).digest()
  return base64url(digest.slice(0, digest.length / 2))
}

module.exports = { base64url, hashToken, bufferFromBase64 }
