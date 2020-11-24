const fromBase64 = (base64) => base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
const base64url = (input) => fromBase64(input.toString('base64'))
const bufferFromBase64 = (b64string) => Buffer.from(b64string, 'base64')

module.exports = {
  base64url,
  bufferFromBase64
}
