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

class Server {
  constructor (env) {
    this.env = env
    this.path = join(__dirname, '..', 'app.js')
  }

  async start () {
    this.child = fork(this.path, [], {env: this.env, silent: true})
    return new Promise((resolve, reject) => {
      const host = this.env.HOST || 'localhost'
      const port = parseInt(this.env.PORT, 10)
      waitForPort(host, port, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  async stop () {
    return new Promise((resolve, reject) => {
      this.child.once('close', (code, signal) => {
        if (code !== 0) {
          reject(new Error('child exited with an error'))
        } else {
          resolve(code, signal)
        }
      })
      this.child.once('error', (err) => {
        reject(err)
      })
      this.child.kill()
    })
  }
}

module.exports = Server
