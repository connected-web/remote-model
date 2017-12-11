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

## Changelog

### 1.0.1

- Add repository information to package.json

### 1.0.0

- Extracted first version from existing project
- Added tests for `fetch` and `notify`
