/** 

Here are the details of your new API account.

Application name        MPD Controller

API key                         5933e74f212f38fa0e7d3527d7f0207d

Shared secret           d7c8986230045267c31491931a4ea0bb

Registered to           cog1to

**/

import { normalizeAlbumName, normalizeArtistName } from '../utils/StringUtils'

export default class LastFM {
    constructor() {
        this.baseApiUrl = 'http://ws.audioscrobbler.com/2.0/?method=album.search&api_key=5933e74f212f38fa0e7d3527d7f0207d&format=json'
    }

    getAlbums(album) {
        console.log(this.baseApiUrl + '&album=' + normalizeAlbumName(album))
        return fetch(this.baseApiUrl + '&album=' + normalizeAlbumName(album))
    }

    getArtUrl(artist, album) {
        return this.getAlbums(album)                    
            .then((response) => {
                //console.log(response)
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
            })
        )
    }
}
