const fs = require('fs')

function read(certpath) {
  try {
    return fs.readFileSync(certpath, 'utf-8')
  } catch(ex) {
    return false
  }
}

module.exports = read
