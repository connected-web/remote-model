import remoteModel from '../src/index.js'
import assert from 'assert'
import sinon from 'sinon'

const expectedRemoteFile = {
  file: 'info.json',
  message: "If you're reading this JSON file you've successfully accessed the remote test"
}

describe('Remote Model - URL', () => {
  const defaultOptions = {
    url: 'https://raw.githubusercontent.com/connected-web/remote-test/master/info.json',
    updateIntervalMs: 60000
  }

  let model, clock
  beforeEach(() => {
    clock = sinon.useFakeTimers()
    model = remoteModel(defaultOptions)
  })

  it('should load a remote model as a promise', async () => {
    const actual = await model.fetch()
    const expected = expectedRemoteFile

    assert.deepEqual(actual, expected)
  })

  it('should resolve the same remote model as a promise when requested multiple times', async () => {
    const actual = await Promise.all([model.fetch(), model.fetch()])

    const expected = [expectedRemoteFile, expectedRemoteFile]

    assert.deepEqual(actual, expected)
  })

  it('should notify listeners when updated', (done) => {
    const expected = expectedRemoteFile

    model.notify((actual) => {
      assert.deepEqual(actual, expected)
      done()
    })
  })

  it('should not notify listeners until a point in the future', (done) => {
    const expected = expectedRemoteFile

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
    const expected = expectedRemoteFile

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

describe('Remote Model - URL - Handling errors', () => {
  let model
  it('should throw an error if an invalid URL is loaded', async () => {
    model = remoteModel({
      url: '/invalid-url/info.json',
      updateIntervalMs: 60000
    })
    try {
      await model.fetch()
      throw new Error('Unexpected success of fetch command')
    } catch (ex) {
      assert.deepEqual(ex.message, 'Only absolute URLs are supported')
    }
  })

  afterEach(() => {
    model.destroy()
  })
})
