/**
Registered app data:

Application name        MPD Controller
API key                 5933e74f212f38fa0e7d3527d7f0207d
Shared secret           d7c8986230045267c31491931a4ea0bb
Registered to           cog1to
**/

import { normalizeAlbumName, normalizeArtistName } from '../utils/StringUtils'

export default class LastFM {
  constructor() {
    this.baseArtistsUrl = 'http://ws.audioscrobbler.com/2.0/?method=artist.search&api_key=5933e74f212f38fa0e7d3527d7f0207d&format=json'
    this.baseAlbumsUrl = 'http://ws.audioscrobbler.com/2.0/?method=album.search&api_key=5933e74f212f38fa0e7d3527d7f0207d&format=json'
  }

  getAlbums(album) {
    return fetch(this.baseAlbumsUrl + '&album=' + normalizeAlbumName(album))
  }

  getArtists(artist) {
    return fetch(this.baseArtistsUrl + '&artist=' + normalizeArtistName(artist))
  }

  getArtUrl(artist, album) {
    return this.getAlbums(album)
      .then((response) => {
        console.log(JSON.stringify(response))
        return response.json()
      })
      .then((json) => new Promise((resolve, reject) => {
        // Normalized artist name.
        let artistNormalized = normalizeArtistName(artist)

        // Get all search results with the matching artist name.
        let matchingAlbums = json['results']['albummatches']['album'].filter(match => {
          return artistNormalized === normalizeArtistName(match['artist'])
        })

        // Get albums with artwork.
        let albumsWithArt = matchingAlbums.filter(match => {
          return (match['image'].length > 0) && (match['image'].filter(img => img['#text'].length > 0).length > 0)
        })

        if (albumsWithArt.length > 0) {
          // Get first match.
          let firstMatch = albumsWithArt[0]

          // Check if it has album art.
          let images = firstMatch['image']
          if (images.length > 0) {
            let largestImage = images[images.length - 1]
            resolve(largestImage['#text'])
            return
          }
        }

        reject()
      }))
  }

  getArtistUrls(artist) {
    return this.getArtists(artist)
      .then((response) => {
        return response.json()
      })
      .then((json) => new Promise((resolve, reject) => {
        // Normalized artist name.
        let artistNormalized = normalizeArtistName(artist)

        // Get all search results with the matching artist name.
        let matchingArtists = json['results']['artistmatches']['artist'].filter(match => {
          return artistNormalized === normalizeArtistName(match['name'])
        })

        let artistsWithArt = matchingArtists.filter(match => {
          return (match['image'].length > 0) && (match['image'].filter(img => img['#text'].length > 0).length > 0)
        })

        if (artistsWithArt.length > 0) {
          for (var index = 0; index < artistsWithArt.length; index++) {
            let artistData = artistsWithArt[index]
            let images = artistData['image']
            
            if (images.length > 0) {
              let urls = {}
              for (var imgIndex = 0; imgIndex < images.length; imgIndex++) {
                let image = images[imgIndex]
                urls[image['size']] = image['#text']
              }
              resolve(urls)
              return 
            }
          }
        }

        reject()
      }))
  }
}

