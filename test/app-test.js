// app-test.js -- main entry point for places.pub server
//
//  Copyright 2017 Evan Prodromou <evan@prodromou.name>
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

const {join} = require('path')
const {fork} = require('child_process')

const waitForPort = require('wait-for-port')
const fetch = require('node-fetch')

const vows = require('perjury')
const {assert} = vows

const env = {
  PORT: 8081
}

const startServer = async function (path, env, host, port) {
  const child = fork(path, [], {env: env, silent: true})
  return new Promise((resolve, reject) => {
    waitForPort(host, port, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(child)
      }
    })
  })
}

const stopServer = async function (child) {
  return new Promise((resolve, reject) => {
    child.once('close', (code, signal) => {
      if (code !== 0) {
        reject(new Error('child exited with an error'))
      } else {
        resolve(code, signal)
      }
    })
    child.once('error', (err) => {
      reject(err)
    })
    child.kill()
  })
}

vows.describe('app loads and listens on correct port')
  .addBatch({
    'When we start the app': {
      topic: async function () {
        const filename = join(__dirname, '..', 'app.js')
        return startServer(filename, env, 'localhost', env.PORT)
      },
      'it works': (err, child) => {
        assert.ifError(err)
        assert.isObject(child)
      },
      'and we fetch the home page': {
        topic: async function () {
          const res = await fetch(`http://localhost:${env.PORT}`)
          return res.text()
        },
        'it works': (err, body) => {
          assert.ifError(err)
          assert.isString(body)
        }
      },
      'teardown': (child) => {
        return stopServer(child)
      }
    }
  })
  .export(module)
