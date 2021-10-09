const nodeFetch = require('node-fetch')
const httpsAgent = require('./httpsAgent')

const defaultUpdateIntervalMs = 5 * 60 * 1000 // 5 minutes in milliseconds

function remoteModel ({ url, fetcher, updateIntervalMs }) {
  const modelUrl = url
  updateIntervalMs = updateIntervalMs || defaultUpdateIntervalMs

  function makeRequest () {
    const agent = httpsAgent()
    const fetchOptions = { agent }
    return nodeFetch(modelUrl, fetchOptions)
      .then(function (res) {
        return res.json()
      })
  }

  const modelFetcher = url ? makeRequest : fetcher
  if (typeof modelFetcher !== 'function') {
    throw new Error(`Invalid fetch function assigned to remote-model: (${typeof modelFetcher})`)
  }

  const listeners = []
  const outstandingPromises = []

  let cachedModel
  let fetching = false

  let registerListener = (callback) => {
    listeners.push(callback)
  }

  function notify () {
    // complete any existing promise chains
    while (outstandingPromises.length > 0) {
      const promise = outstandingPromises.shift()
      promise.resolve(cachedModel)
    }
    // notify any listeners
    listeners.forEach((callback) => {
      callback(cachedModel)
    })
  }

  function updateModel () {
    // set the fetching flag
    fetching = true
    return modelFetcher()
      .then(modelResult => {
        // cache data for future requests
        cachedModel = modelResult
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
          const promise = outstandingPromises.shift()
          promise.reject(ex)
        }
        // reject the current promise chain
        throw ex
      })
  }

  let fetch = () => {
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

  let destroy = () => {
    clearInterval(interval)
    cachedModel = false

    const destroyed = () => {
      throw new Error('Model has been destroyed.')
    }

    fetch = destroyed
    registerListener = destroyed
    destroy = destroyed
  }

  // Prepare for future update
  const interval = setInterval(() => {
    updateModel()
  }, updateIntervalMs)

  // Heat up the cache immediately
  fetch()

  return {
    fetch,
    notify: registerListener,
    destroy
  }
}

module.exports = remoteModel
