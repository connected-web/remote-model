# Remote Model

A fetcher for an externally hosted config file, that is released on a different cadence to your service

Written in javascript, for node based projects.

## Features

- Auto update after _n_ milliseconds (default, 5 minutes)
- Synchronous call caching
- Hot caching
- Can use any async method inplace of the network operation

Benefits of this approach - multiple callers can request data, but only one network call will be made. This ensures that all parts of your application receive the latest data at the same time.

## Quickstart

Install:
```
npm install --save remote-model
```

## Default behaviour with URL

HTTPS Usage, e.g. download file from remote host:
```js
const remoteModel = require('remote-model')

const myModel = remoteModel({
  url: 'https://raw.githubusercontent.com/connected-web/remote-test/master/info.json',
  updateIntervalMs: 10 * 60 * 1000 // 10 minutes
})

myModel.fetch().then((data) => {
  console.log('[My Model]', data)
})

myModel.notify((data) => {
  console.log('[My Model] Updated', data)
})
```

## Using a custom fetch function

Custom fetch usage, e.g. on a local filesystem:
```js
const remoteModel = require('remote-model')
const fs = require('fs/promises')

const myModel = remoteModel({
  fetcher: () => {
    return fs.readFile('local-model-to-watch.json', 'utf8'),
    updateIntervalMs: 2 * 60 * 1000 // 2 minutes
  }
})

myModel.fetch().then((data) => {
  console.log('[My Custom Fetch Model]', data)
})

myModel.notify((data) => {
  console.log('[My Custom Fetch Model] Updated', data)
})

```

## HTTPS Agent

In order to access content securely over HTTPS, the `https` lib is used to create a https agent for network requests. It is recommended that you set up the following environment variables prior to running your script. By default, the script expects the `CLIENT_CERT`, `CLIENT_KEY`, and `CLIENT_CA` to exist, for example:

```sh
export CLIENT_CERT="/user/certs/path.crt"
export CLIENT_KEY="/user/certs/path.key"
export CLIENT_CA="/user/certs/ca_bundle.crt"
```

## Changelog

### 1.0.3

- Fix promise rejection on outstanding promises

### 1.0.2

- Add information about HTTPS Agent

### 1.0.1

- Add repository information to package.json

### 1.0.0

- Extracted first version from existing project
- Added tests for `fetch` and `notify`
