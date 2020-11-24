function addErrorMessage (req, err) {
  if (req) {
    if (!req.error) {
      req.error = []
    }
    console.log('err added:', err)
    req.error.push(err)
  }
}
module.exports = { addErrorMessage }
