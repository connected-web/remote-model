const https = require('https')
const read = require('./read')

const cert = read(process.env.CLIENT_CERT)
const key = read(process.env.CLIENT_KEY)
const ca = read(process.env.CLIENT_CA)

function create () {
  return new https.Agent({ cert, key, ca, keepAlive: true, keepAliveMsecs: 15000 })
}

module.exports = create
