// app.js -- main entry point for places.pub server
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

const assert = require('assert')
const express = require('express')
const path = require('path')
const fetch = require('node-fetch')
const qs = require('querystring')
const _ = require('lodash')

const AS2 = 'https://www.w3.org/ns/activitystreams'
const VCARD = 'http://www.w3.org/2006/vcard/ns#'

const app = express()

function makeURI (path) {
  return `${process.env.URL_ROOT}${path}`
}

function naddr2as2 (naddr) {
  assert.ok(_.isObject(naddr))
  const addr = {
    type: 'vcard:Address',
    'vcard:street-address': ((naddr.house_number) ? `${naddr.house_number} ${naddr.road}` : naddr.road),
    'vcard:locality': naddr.city,
    'vcard:region': naddr.state,
    'vcard:country-name': naddr.country,
    'vcard:postal-code': naddr.postcode
  }
  assert.ok(_.isObject(addr))
  return addr
}

function nominatimToAS2 (nplace) {
  const name = (nplace.namedetails.name) ? nplace.namedetails.name : nplace.display_name
  let prefix = null
  if (nplace.osm_type === 'node') {
    prefix = 'N'
  } else if (nplace.osm_type === 'way') {
    prefix = 'W'
  } else if (nplace.osm_type === 'relations') {
    prefix = 'R'
  } else {
    throw new Error(`Unexpected osm_type ${nplace.osm_type}`)
  }

  const id = `${prefix}${nplace.osm_id}`

  const as2place = {
    '@context': [AS2, {vcard: VCARD}],
    type: 'Place',
    id: makeURI(`/osm/${id}`),
    name: name,
    latitude: parseFloat(nplace.lat),
    longitude: parseFloat(nplace.lon)
  }

  if (_.isObject(nplace.address)) {
    as2place['vcard:hasAddress'] = naddr2as2(nplace.address)
    assert.ok(_.isObject(as2place['vcard:hasAddress']))
  }

  return as2place
}

app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, 'src')))

// Place route

app.get('/osm/:id', async (req, res, next) => {
  const {id} = req.params
  const qa = {
    osm_ids: id,
    format: 'json',
    namedetails: 1,
    addressdetails: 1,
    email: process.env.EMAIL
  }
  const qp = qs.stringify(qa)
  const url = `http://nominatim.openstreetmap.org/lookup?${qp}`
  try {
    // TODO: cache results
    const nres = await fetch(url)
    const njson = await nres.json()
    if (!Array.isArray(njson)) {
      throw new Error(`Unexpected result type: ${typeof njson}`)
    }
    if (njson.length !== 1) {
      throw new Error(`Unexpected result length: ${njson.length}`)
    }
    const [nplace] = njson
    const as2place = nominatimToAS2(nplace)
    res.json(as2place)
  } catch (err) {
    next(err)
  }
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.use((err, req, res, next) => {
  if (req.is('json')) {
    res.json({
      status: 'Error',
      message: err.message
    })
  } else {
    next()
  }
})

const DEFAULT_PORT = 8080
const port = (process.env.PORT) ? parseInt(process.env.PORT, 10) : DEFAULT_PORT

app.listen(port)

console.log(`Server listening on localhost:${port}`)
