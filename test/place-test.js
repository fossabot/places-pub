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
const env = require('./env')

const AS2 = 'https://www.w3.org/ns/activitystreams'
const VCARD = 'http://www.w3.org/2006/vcard/ns#'

vows.describe('place endpoint')
  .addBatch({
    'When we start the app': {
      topic: async function () {
        const server = new Server(env)
        await server.start()
        return server
      },
      'it works': (err, server) => {
        assert.ifError(err)
        assert.isObject(server)
      },
      'and we fetch a place by ID': {
        topic: async function () {
          const headers = {
            'Accept': 'application/activity+json;1.0,application/ld+json;0.5,application/json;0.1'
          }
          const url = `http://${env.HOSTNAME}:${env.PORT}/osm/W444744679`
          const res = await fetch(url, {headers: headers})
          return res.json()
        },
        'it works': (err, body) => {
          assert.ifError(err)
          assert.isObject(body, 'Body of place is not an object')
          assert.isArray(body['@context'])
          assert.lengthOf(body['@context'], 2)
          assert.isString(body['@context'][0])
          assert.equal(body['@context'][0], AS2)
          assert.isObject(body['@context'][1], 'Context element 1 is not an object')
          assert.deepEqual(body['@context'][1], {vcard: VCARD})
          assert.isString(body.type)
          assert.equal(body.type, 'Place')
          assert.isString(body.id)
          assert.equal(body.id, `${env.URL_ROOT}/osm/W444744679`)
          assert.isString(body.name)
          assert.greater(body.name.length, 0)
          assert.isNumber(body.latitude)
          assert.isNumber(body.longitude)
          assert.isObject(body['vcard:hasAddress'], 'Address of Place is not an object')
          const addr = body['vcard:hasAddress']
          console.dir(addr)
          assert.equal(addr.type, 'vcard:Address')
          assert.equal(addr['vcard:street-address'], '117 Rotherhithe Street')
          assert.equal(addr['vcard:locality'], 'London')
          assert.equal(addr['vcard:region'], 'England')
          assert.equal(addr['vcard:country-name'], 'UK')
          assert.equal(addr['vcard:postal-code'], 'SE16 4NF')
        }
      },
      'and we fetch a place that does not exist': {
        topic: async function () {
          const headers = {
            'Accept': 'application/activity+json;1.0,application/ld+json;0.5,application/json;0.1'
          }
          const url = `http://${env.HOSTNAME}:${env.PORT}/osm/WNOTANID`
          return fetch(url, {headers: headers})
        },
        'it works': (err, res) => {
          assert.ifError(err)
          assert.isObject(res)
          assert.equal(res.status, 404)
        }
      },
      'teardown': (server) => {
        return server.stop()
      }
    }
  })
  .export(module)
