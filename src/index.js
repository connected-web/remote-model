const nodeFetch = require('node-fetch')
const httpsAgent = require('./httpsAgent')

const defaultUpdateIntervalMs = 5 * 60 * 1000 // 5 minutes in milliseconds

const agent = httpsAgent()

function remoteModel ({url, updateIntervalMs}) {
  const modelUrl = url
  updateIntervalMs = updateIntervalMs || defaultUpdateIntervalMs

  const fetchOptions = { agent }
  const listeners = []
  const outstandingPromises = []

  let cachedModel
  let fetching = false

  function registerListener (callback) {
    listeners.push(callback)
  }

  function notify () {
    // complete any existing promise chains
    while (outstandingPromises.length > 0) {
      let promise = outstandingPromises.shift()
      promise.resolve(cachedModel)
    }
    // notify any listeners
    listeners.forEach((callback) => {
      callback(cachedModel)
    })
  }

  function makeRequest () {
    return nodeFetch(modelUrl, fetchOptions)
      .then(function (res) {
        return res.json()
      })
  }

  function updateModel () {
    // set the fetching flag
    fetching = true
    return makeRequest()
      .then(parsedJson => {
        // cache data for future requests
        cachedModel = parsedJson
        // clear the fetching flag
        fetching = false
        // notify listeners that the model has been updated
        notify()
        // return data
        return cachedModel
      })
      .catch((ex) => {
        // clear the fetching flag
        fetching = false
        // reject any outstanding promise chains
        while (outstandingPromises.length > 0) {
          let promise = outstandingPromises.unshift()
          promise.reject(ex)
        }
        // reject the current promise chain
        throw ex
      })
  }

  function fetch () {
    if (cachedModel) {
      return Promise.resolve(cachedModel)
    } else if (fetching) {
      return new Promise((resolve, reject) => {
        outstandingPromises.push({ resolve, reject })
      })
    } else {
      return updateModel()
    }
  }

  // Prepare for future update
  let interval = setInterval(() => {
    updateModel()
  }, updateIntervalMs)

  // Heat up the cache immediately
  fetch()

  function destroy() {
    clearInterval(interval)
    cachedModel = false

    const destroyed = () => {
      throw new Error('Model has been destroyed.')
    }

    fetch = destroyed
    registerListener = destroyed
    destroy = destroyed
  }

  return {
    fetch,
    notify: registerListener,
    destroy
  }
}

module.exports = remoteModel
