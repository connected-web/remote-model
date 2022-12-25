import fs from 'fs'

function read (certpath) {
  try {
    return fs.readFileSync(certpath, 'utf-8')
  } catch (ex) {
    return false
  }
}

export default read
