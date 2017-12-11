# Remote Model

A fetcher for an externally hosted config file, that is released on a different cadence to your service

Written in javascript, for node based projects.

## Features

- Auto update after _n_ milliseconds (default, 5 minutes)
- Synchronous call caching
- Hot caching

## How to use

Install:
```
npm install --save remote-model
```

Use:
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

## HTTPS Agent

In order to access content securely over HTTPS, the `https` lib is used to create a https agent for network requests. It is recommended that you set up the following environment variables prior to running your script. By default, the script expects the `CLIENT_CERT`, `CLIENT_KEY`, and `CLIENT_CA` to exist, for example:

```sh
export CLIENT_CERT="/user/certs/path.crt"
export CLIENT_KEY="/user/certs/path.key"
export CLIENT_CA="/user/certs/ca_bundle.crt"
```

## Changelog

### 1.0.2

- Add information about HTTPS Agent

### 1.0.1

- Add repository information to package.json

### 1.0.0

- Extracted first version from existing project
- Added tests for `fetch` and `notify`
