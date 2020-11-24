// openssl public/private/modulus/exponent:  https://medium.com/@bn121rajesh/rsa-sign-and-verify-using-openssl-behind-the-scene-bf3cac0aade2

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const { hashToken } = require('./utils')
const db = require('./db')
const CONFIG = db.config.findOne()
const v = require('./mw/validator')

// SHOULD BE ENV
const RSA_KEYPAIR = new (require('./rsa').KeyPair)()
const PORT = process.env.PORT || 9000

// SHOULD BE GENERATED FOR THE SESSION
const CODE = 'SESAME'

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// middlewares

app.get('/.well-known/openid-configuration', (req, res, next) => {
  const discovery = JSON.parse(JSON.stringify(CONFIG).replace(/\$\{HOST\}/g, req.headers.host))
  res.json(discovery)
})

app.get('/jwks_uri', (req, res, next) => {
  console.log('GET', req.originalUrl)
  console.log('============================================================================================================================================')
  res.json({
    keys: [
      {
        kty: 'RSA',
        kid: '1',
        e: RSA_KEYPAIR.exponent,
        n: RSA_KEYPAIR.modulus
      }
    ]
  })
})

let nonceSaved
let scopeSaved
let codeChallengeSaved
let codeChallengeMethodSaved
let requestedUrlSaved
// let loaSaved
let clientSaved
let userSaved

app.get('/authorise',
  v.mwClientIdValidator,
  v.mwResponseTypeValidator,
  v.mwScopeValidator,
  v.mwCodeChallengeValidator, (req, res, next) => {
    const { originalUrl, headers, error, query: { state, scope, nonce, redirect_uri: redirectUri, 'requested-url': requestedUrl, code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod, client_id: clientId } } = req
    console.debug('GET request:', originalUrl)
    console.debug('user-agent:', headers['user-agent'])

    // keep in memory for the next call to /token
    nonceSaved = nonce
    scopeSaved = scope
    codeChallengeSaved = codeChallenge
    codeChallengeMethodSaved = codeChallengeMethod
    requestedUrlSaved = requestedUrl
    // loaSaved = loa
    clientSaved = db.clients.findOne({ client: clientId })

    // REDIRECT TO LOGIN FORM

    // AND THEN DO THE REDIRECT IN /login
    userSaved = db.users.findOne({ client: clientSaved, username: 'djelassi' })

    if (!error) {
      console.debug('Authorization code flow')

      let url = `${redirectUri}?&code=${CODE}`

      state && (url += `&state=${state}`)

      // &loa=3
      // nonce && (url += `&nonce=${req.query.nonce}`)
      // requestedUrl && (url += `&requested-url=${encodeURIComponent(requestedUrl)}`)

      console.log(`

      -> redirecting to: ${url}`)
      console.log('============================================================================================================================================')
      res.redirect(url)
      return
    }

    if (req.error) {
      res.status(400).json({ error: req.error, url: req.originalUrl })
    } else {
      res.status(400).json({ error: 'bad request', url: req.originalUrl })
    }
  })

app.post('/token', (req, res, next) => {
  console.log('POST', req.originalUrl)
  console.log(req.body)
  console.log('============================================================================================================================================')

  const payload = {
    sub: userSaved.username,
    email: userSaved.email,

    email_verified: userSaved.email_verified,
    loa: `${userSaved.loa}`,
    aud: `${userSaved.audience.join(' ')}`,
    // exp: Math.floor(new Date().getTime() / 1000 + clientSaved.access_token_expiration),
    iss: CONFIG.issuer
  }
  const accessToken = jwt.sign(payload, RSA_KEYPAIR.privatePEM, { algorithm: clientSaved.algorithm, expiresIn: clientSaved.access_token_expiration })

  // for ID TOKEN, at_hash and nonce are required
  payload.at_hash = hashToken(accessToken)
  payload.nonce = nonceSaved
  const idToken = jwt.sign(payload, RSA_KEYPAIR.privatePEM, { algorithm: clientSaved.algorithm, expiresIn: clientSaved.id_token_expiration })

  res.json({
    access_token: accessToken,
    expires_in: clientSaved.access_token_expiration,
    id_token: idToken,
    scope: CONFIG.scopes_supported.join(' '),
    token_type: 'Bearer'
  })
})

app.all('/*', (req, res, next) => {
  console.log('=========================================')
  console.log(req.originalUrl)
  console.log('-----------------------------------------')
  console.log(req.headers)
  console.log('-----------------------------------------')
  console.log(req.query)
  console.log('-----------------------------------------')
  console.log(req.body)
  console.log('=========================================')

  const jsonResponse = { error: 'bad request', url: req.originalUrl }

  if (req.headers) {
    jsonResponse.headers = req.headers
  }
  if (req.body) {
    jsonResponse.body = req.body
  }
  res.status(400).json(jsonResponse)
})

app.listen(PORT, () => console.log(`

########################################################################
            server started and listening on port ${PORT}
########################################################################

discovery url      -> http://localhost.wipo.int:9000/.well-known/openid-configuration
  
`))
