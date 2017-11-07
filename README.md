# places.pub

[![Build Status](https://travis-ci.org/evanp/places-pub.svg?branch=master)](https://travis-ci.org/evanp/places-pub)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fevanp%2Fplaces-pub.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fevanp%2Fplaces-pub?ref=badge_shield)

This is the source code for the [places.pub](https://places.pub/) service. It
provides a vocabulary for [Activity Streams 2.0](https://www.w3.org/TR/activitystreams-core/) [Place](https://www.w3.org/TR/activitystreams-vocabulary/#dfn-place) objects,
using the [OpenStreetMap](https://openstreetmap.org/) vocabulary.

## LICENSE

Copyright 2017 Evan Prodromou <mailto:evan@prodromou.name>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fevanp%2Fplaces-pub.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fevanp%2Fplaces-pub?ref=badge_large)

## How to use it

There are three important kinds of URLs for places.pub, as defined by the following [URI templates](https://tools.ietf.org/html/rfc6570).

### <https://places.pub/osm/{id}>

Represents a single place defined by the OpenStreetMap ID number `id`.

The server will do [content negotation](https://www.w3.org/Protocols/rfc2616/rfc2616-sec12.html) to figure out what kind of content to return. This will usually be either HTML or Activity Streams 2.0 JSON.

### <https://places.pub/osm/search?{?q,lang,lat,lon,d}>

Finds OpenStreetMap places that match the search terms, possibly within a bounding box.

*   `q`: Free text search term, like `Montreal` or `Slanted Door`. Optional.
*   `lang`: Language code for the free text search term. Optional, defaults to
    Esperanto, `eo`. Kial ne?
*   `lat`: Latitude of center of bounding box, in decimal form. Optional.
    Generates an error if provided without `lon`.
*   `lon`: Longitude of center of bounding box, in decimal form. Optional.
    Generates an error if provided without `lon`.
*   `d`: Half of the length of one edge of the bounding box, in meters.
    Generates an error if provided without `lat` and `lon`.  Optional.
    Defaults to 50.
*   `limit`: Number of places to return. Defaults to 10.
*   `offset`: Number of places to skip. Defaults to 0.
*   `before`: Show `count` items that would be shown *before* this item, not
    inclusive. So, given numerical sorting, `search?count=3&before=9` would return
    values 6, 7, and 8. (Note: just an example. The relevance is more complicated than this,
    and that's not how OSM IDs work!).
*   `after`: Show `count` items that would be shown *after* this item, not
    inclusive. So, given numerical sorting, `search?count=3&after=9` would return
    values 10, 11, and 12. (Note: just an example. The relevance is more complicated than this,
    and that's not how OSM IDs work!).

Some examples of good queries:

*   <https://places.pub/osm/search?q=Montréal?lang=fr>
*   <https://places.pub/osm/search?q=Montreal?lang=en>
*   <https://places.pub/osm/search?lat=52.36304325&lon=4.88285962668329>
*   <https://places.pub/osm/search?q=de+Balie&lat=52.36304325&lon=4.88285962668329>
*   <https://places.pub/osm/search?q=de+Balie&lat=52.36304325&lon=4.88285962668329&d=100>
*   <https://places.pub/osm/search?q=McDonalds&offset=240&limit=10>
*   <https://places.pub/osm/search?q=McDonalds&before=N433592579>
*   <https://places.pub/osm/search?q=McDonalds&after=N433592579&limit=10>

The server will do [content negotation](https://www.w3.org/Protocols/rfc2616/rfc2616-sec12.html) to figure out what kind of content to return. This will usually be either HTML or Activity Streams 2.0 JSON.

If it is AS2, it will be a paged [collection](https://www.w3.org/TR/activitystreams-core/#collections) of Place objects.
The `first`, `last`, `next` and `prev` properties are useful for paging.

### <https://places.pub/osm/version>

Returns the version of the places.pub API currently in use. This follows [semantic versioning](http://semver.org/), such that:

    Given a version number MAJOR.MINOR.PATCH, increment the:

      MAJOR version when you make incompatible API changes,
      MINOR version when you add functionality in a backwards-compatible manner, and
      PATCH version when you make backwards-compatible bug fixes.

    Additional labels for pre-release and build metadata are available as
    extensions to the MAJOR.MINOR.PATCH format.

(...as stated on the Semver site.) Note that this will probably but not
necessarily track to the places.pub software version.

The server will do [content negotation](https://www.w3.org/Protocols/rfc2616/rfc2616-sec12.html) to figure out what kind of content to return. This will usually be either HTML or JSON.

If it is JSON, it will be single string, containing the version.

In the future, if there are incompatible versions of this API, we'll probably
do something to make sure old software doesn't break, like move the new
version of the API to `/osm/v2/` or something.