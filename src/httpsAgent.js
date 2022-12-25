import https from 'https'
import read from './read.js'

let env = {}
if (typeof process !== 'undefined') {
  env = process.env ?? {}
} else if (typeof import.meta?.env !== 'undefined') {
  env = import.meta.env
}

const cert = read(env.CLIENT_CERT)
const key = read(env.CLIENT_KEY)
const ca = read(env.CLIENT_CA)

function create () {
  return new https.Agent({ cert, key, ca, keepAlive: true, keepAliveMsecs: 15000 })
}

export default create
