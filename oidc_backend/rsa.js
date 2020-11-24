// examples: https://gist.github.com/bellbind/a9782c8fa502bcb3f900

const forge = require('node-forge')

const test = () => {
  const keypair = forge.pki.rsa.generateKeyPair()

  const priv = keypair.privateKey
  const pub = keypair.publicKey

  // PEM serialize: public key
  const pubPem = forge.pki.publicKeyToPem(pub)
  console.log('Public Key PEM:', pubPem)
  // const pub2 = forge.pki.publicKeyFromPem(pubPem)

  // PEM serialize: private key
  const privPem = forge.pki.privateKeyToPem(priv)
  console.log('Private Key PEM:', privPem)

  // GET modulus and exponent from the public key

  const parseBigInteger = (b64) => new forge.jsbn.BigInteger(forge.util.createBuffer(forge.util.decode64(b64)).toHex(), 16)
  const bigIntegerToBase64Url = (n) => forge.util.encode64(forge.util.hexToBytes(n.toString(16))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  console.log('------------------------------------------------------')
  console.log(pub.n)
  console.log('------------------------------------------------------')
  console.log('modulus:')
  console.log(bigIntegerToBase64Url(pub.n))
  console.log('------------------------------------------------------')
  console.log('exponent:')
  console.log(bigIntegerToBase64Url(pub.e))
  console.log('------------------------------------------------------')
  console.log('not necessary, just for test reverse equality')
  console.log(parseBigInteger(forge.util.encode64(forge.util.hexToBytes(pub.n.toString(16)))) === pub.n)
  console.log('------------------------------------------------------')

  const modulus = 'nzyis1ZjfNB0bBgKFMSvvkTtwlvBsaJq7S5wA+kzeVOVpVWwkWdVha4s38XM/pa/yr47av7+z3VTmvDRyAHcaT92whREFpLv9cj5lTeJSibyr/Mrm/YtjCZVWgaOYIhwrXwKLqPr/11inWsAkfIytvHWTxZYEcXLgAXFuUuaS3uF9gEiNQwzGTU1v0FqkqTBr4B8nW3HCN47XUu0t8Y0e+lf4s4OxQawWD79J9/5d3Ry0vbV3Am1FtGJiJvOwRsIfVChDpYStTcHTCMqtvWbV6L11BWkpzGXSW4Hv43qa+GSYOD2QU68Mb59oSk2OB+BtOLpJofmbGEGgvmwyCI9Mw'

  const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnzyis1ZjfNB0bBgKFMSv
    vkTtwlvBsaJq7S5wA+kzeVOVpVWwkWdVha4s38XM/pa/yr47av7+z3VTmvDRyAHc
    aT92whREFpLv9cj5lTeJSibyr/Mrm/YtjCZVWgaOYIhwrXwKLqPr/11inWsAkfIy
    tvHWTxZYEcXLgAXFuUuaS3uF9gEiNQwzGTU1v0FqkqTBr4B8nW3HCN47XUu0t8Y0
    e+lf4s4OxQawWD79J9/5d3Ry0vbV3Am1FtGJiJvOwRsIfVChDpYStTcHTCMqtvWb
    V6L11BWkpzGXSW4Hv43qa+GSYOD2QU68Mb59oSk2OB+BtOLpJofmbGEGgvmwyCI9
    MwIDAQAB
    -----END PUBLIC KEY-----`
  console.log(modulus)
  console.log(bigIntegerToBase64Url(forge.pki.publicKeyFromPem(PUBLIC_KEY).n))
}

false && test()

class KeyPair {
  constructor () {
    const _keypair = forge.pki.rsa.generateKeyPair()
    this.publicKey = _keypair.publicKey
    this.privateKey = _keypair.privateKey
    this.modulus = this.bigIntegerToBase64Url(this.publicKey.n)
    this.exponent = this.bigIntegerToBase64Url(this.publicKey.e)
    this.publicPEM = forge.pki.publicKeyToPem(this.publicKey)
    this.privatePEM = forge.pki.privateKeyToPem(this.privateKey)
  }

  bigIntegerToBase64Url (n) { return forge.util.encode64(forge.util.hexToBytes(n.toString(16))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_') }

  parseBigInteger (b64) { return new forge.jsbn.BigInteger(forge.util.createBuffer(forge.util.decode64(b64)).toHex(), 16) }
  publicKeyFromPem (pem) { return forge.pki.publicKeyFromPem(pem) }
}

console.log(new KeyPair())

module.exports = {
  KeyPair
}
