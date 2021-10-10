const remoteModel = require('../')
const assert = require('assert')
const sinon = require('sinon')
const path = require('path')
const fs = require('fs/promises')

const expectedLocalFile = {
  some: 'test fixture',
  data: [1, 2, 3, 4]
}

describe('Remote Model - Custom Fetch', () => {
  const localModelPath = path.join(__dirname, 'fixtures/local-model-to-watch.json')
  const defaultOptions = {
    async fetcher () {
      const fileContents = await fs.readFile(localModelPath, 'utf8')
      return JSON.parse(fileContents)
    },
    updateIntervalMs: 2 * 60 * 1000 // 2 minutes
  }

  let model, clock
  beforeEach(() => {
    clock = sinon.useFakeTimers()
    model = remoteModel(defaultOptions)
  })

  it('should load a local model as a promise', async () => {
    const actual = await model.fetch()
    const expected = expectedLocalFile

    assert.deepEqual(actual, expected)
  })

  it('should resolve the same local model as a promise when requested multiple times', async () => {
    const actual = await Promise.all([model.fetch(), model.fetch()])

    const expected = [expectedLocalFile, expectedLocalFile]

    assert.deepEqual(actual, expected)
  })

  it('should notify listeners when updated', (done) => {
    const expected = expectedLocalFile

    model.notify((actual) => {
      assert.deepEqual(actual, expected)
      done()
    })
  })

  it('should not notify listeners until a point in the future', (done) => {
    const expected = expectedLocalFile

    model.destroy()

    clock = sinon.useFakeTimers()
    model = remoteModel(defaultOptions)

    model.fetch().then(() => {
      model.notify((actual) => {
        assert.deepEqual(actual, expected)
        done('Unexpected call to notify')
      })
      clock.tick(defaultOptions.updateIntervalMs - 1)
    })
      .then(done)
  })

  it('should notify listeners when updated in the future', (done) => {
    const expected = expectedLocalFile

    model.fetch().then(() => {
      clock.tick(1)
      model.notify((actual) => {
        assert.deepEqual(actual, expected)
        done()
      })
      clock.tick(defaultOptions.updateIntervalMs + 1)
    })
  })
  afterEach(() => {
    clock.restore()
    clock = false
    model.destroy()
  })
})

describe('Remote Model - Custom Fetch - Handling errors', () => {
  let model
  it('should throw an error if an invalid fetcher is provided', async () => {
    try {
      model = remoteModel({
        fetcher: 'not a function',
        updateIntervalMs: 60000
      })
      await model.fetch()
      throw new Error('Unexpected success of fetch command')
    } catch (ex) {
      assert.deepEqual(ex.message, 'Invalid fetch function assigned to remote-model: (string)')
    }
  })

  afterEach(() => {
    if (model) {
      model.destroy()
    }
  })
})
