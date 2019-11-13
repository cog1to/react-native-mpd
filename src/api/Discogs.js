/**
 * MPD Controller
 *
 * Consumer Key:      zZHKJZMufAjXGaRUIgBI
 * Consumer Secret:   yqyZRHFaeTvzdtHeqOQRuTrcdcRMXyyC
 * Request Token URL: https://api.discogs.com/oauth/request_token
 * Authorize URL:     https://www.discogs.com/oauth/authorize
 * Access Token URL:  https://api.discogs.com/oauth/access_token
 */

import { Platform } from 'react-native'
import { normalizeAlbumName, normalizeArtistName } from '../utils/StringUtils'

export default class Discogs {
  constructor() {
    // Request building.
    this.key = 'zZHKJZMufAjXGaRUIgBI'
    this.secret = 'yqyZRHFaeTvzdtHeqOQRuTrcdcRMXyyC' 
    this.baseUrl = 'https://api.discogs.com/database/'

    // Queue.
    this.queue = []
    this.current = null
    this.lastCall = null
  }

  getArtistUrls(artist, success, error) {
    this.queue.splice(0, 0, { artist, success, error })
    this.checkCurrent()
  }

  checkCurrent() {
    // NOTE: Rate limiting logic. 
    // Official Discogs rate limit - 60 calls per minute, or (approximately) one call per second.
    if (this.current == null && this.queue.length > 0) {
      let now = Date.now()
      if (this.lastCall == null || (now - this.lastCall) > 1000) {
        this.lastCall = now
        this.current = this.queue.pop()

        const { artist, success, error } = this.current
        this._getArtistUrls(artist, success, error)
      } else {
        setTimeout(() => this.checkCurrent(), 1000 - (now - this.lastCall))
      }
    }
  }

  _getArtistUrls(artist, success, error) {
    let self = this

    // Construct the link.
    let url = this.baseUrl +
      'search?q=' + encodeURIComponent(normalizeArtistName(artist)) +
      '&type=artist&per_page=5&key=' + this.key +
      '&secret=' + this.secret
    let options = {
      headers: {
        'User-Agent': 'Yamp-' + Platform.OS + '/1.0'
      }
    }

    // Fetch the data.
    fetch(url, options)
    .then(response => {
      return response.json()
    })
    .then(json => {
      let results = json['results']
      if (results == null) {
        return {}
      }

      let matches = []
      for (var index = 0; index < results.length; index++) {
        let match = results[index]
        if (match['title'] == artist && match['thumb'] != null && match['thumb'] != "") {
          matches.push(match)
        }
      }

      if (matches.length == 0) {
        return {}
      }

      return { small: matches[0]['thumb'], large: matches[0]['cover_image'] }
    })
    .then(result => {
      success(result)
    })
    .catch(err => {
      console.log(err)
      error(err)
    })
    .finally(() => {
      self.current = null
      self.checkCurrent()
    })
  }
}
