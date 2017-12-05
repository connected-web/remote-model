const remoteModel = require('../')
const assert = require('assert')

describe('Remote Model', () => {
  const defaultOptions = {
    modelUrl: 'https://raw.githubusercontent.com/connected-web/remote-test/master/info.json',
    defaultUpdateIntervalMs: 60000
  }

  let model
  beforeEach(() => {
    model = remoteModel(defaultOptions)
  })

  it('should load a remote model as a promise', async () => {
    let actual = await model.fetch()
    let expected = {
      'file': 'info.json',
      'message': "If you're reading this JSON file you've successfully accessed the remote test"
    }
    
    assert.deepEqual(actual, expected)
  })

  afterEach(() => {
    model.destroy()
  })
})
