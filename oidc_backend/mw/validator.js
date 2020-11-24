const { addErrorMessage } = require('../utils/error')
const CONFIG = require('../discovery')
// SHOULD BE ENV
const RESPONSE_TYPE_LIST = ['code']
// FROM CLIENT DB
const CLIENT_ID_LIST = ['foo']

const mwClientIdValidator = (req, res, next) => {
  const { query: { client_id: clientId } } = req
  if (!clientId) {
    addErrorMessage(req, 'client_id is required')
  } else if (!CLIENT_ID_LIST.some(ci => ci === clientId)) {
    addErrorMessage(req, `client_id: '${clientId}' not registered`)
  }
  next()
}

const mwResponseTypeValidator = (req, res, next) => {
  const { query: { response_type: responseType } } = req
  if (!responseType) {
    addErrorMessage(req, 'response_type is required')
  } else if (!RESPONSE_TYPE_LIST.some(rt => rt === responseType)) {
    addErrorMessage(req, `response_type: '${responseType}' not allowed`)
  }
  next()
}

const mwScopeValidator = (req, res, next) => {
  const { query: { scope } } = req
  if (scope) {
    if (!CONFIG || !CONFIG.response_types_supported) {
      addErrorMessage(req, `scope: '${scope}' not allowed`)
    } else {
      const scopeNotValidList = []
      scope.split(/\s+/).forEach(s => {
        if (!CONFIG.scopes_supported.some(rts => rts === s)) {
          scopeNotValidList.push(s)
        }
      })
      if (scopeNotValidList.length) {
        addErrorMessage(req, `scope: '${scopeNotValidList.join(' ')}' not allowed`)
      }
    }
  }
  next()
}

const mwCodeChallengeValidator = (req, res, next) => {
  const { query: { code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod } } = req
  if (codeChallenge && !codeChallengeMethod) {
    addErrorMessage(req, 'code_challenge_method is required')
  } else if (!codeChallenge && codeChallengeMethod) {
    addErrorMessage(req, 'code_challenge is required')
  } else if (codeChallenge && codeChallengeMethod) {
    if (!CONFIG.code_challenge_methods_supported.some(ccms => ccms === codeChallengeMethod)) {
      addErrorMessage(req, `code_challenge_method '${codeChallengeMethod}' is not allowed`)
    }
  }
  next()
}

module.exports = { mwClientIdValidator, mwCodeChallengeValidator, mwResponseTypeValidator, mwScopeValidator }
