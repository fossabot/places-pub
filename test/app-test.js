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

const fetch = require('node-fetch')

const vows = require('perjury')
const {assert} = vows

const Server = require('./server')

const env = {
  PORT: 8081
}

vows.describe('app loads and listens on correct port')
  .addBatch({
    'When we start the app': {
      topic: async function () {
        const server = new Server(env)
        await server.start()
        return server
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
      'teardown': (server) => {
        return server.stop()
      }
    }
  })
  .export(module)
