import { AsyncStorage } from 'react-native'

const KEYS = {
  SAVED_ADDRESS: 'SAVED_ADDRESS',
  CURRENT_THEME: 'CURRENT_THEME',
  ARTIST_ART: 'ARTIST_ART',
}

export default class LocalStorage {

  // Singleton.

  static instance() {
    return _instance
  }

  // Saving and loading.

  addArtistArt(artist, urls, callback) {
    let self = this
    this._getValue(KEYS.ARTIST_ART, (error, result) => {
      if (error != null) {
        callback(error, null)
        return
      }

      try {
        var artists = null

        if (result != null) {
          artists = JSON.parse(result)
        }

        if (artists == null) {
          artists = {}
        }

        artists[artist] = urls
        let updated = JSON.stringify(artists)
        self._setValue(KEYS.ARTIST_ART, updated, (error) => {
          callback(error)
        })
      } catch (err) {
        callback(err, null)
      }
    }).catch(err => {
      callback(err, null)
    })
  }

  loadArtistArt(callback) {
    this._getValue(KEYS.ARTIST_ART, (error, result) => {
      if (error != null) {
        callback(error, null)
        return
      }

      try {
        if (result != null) {
          const artists = JSON.parse(result)
          callback(null, artists)
        } else {
          callback(null, {})
        }
      } catch (error) {
        callback(error, null)
      }
    })
  }

  getSavedAddress(callback) {
    this._getValue(KEYS.SAVED_ADDRESS, (error, result) => {
      if (error != null) {
        callback(error, null)
        return
      }

      try {
        if (result != null) {
          const address = JSON.parse(result)
          callback(null, address)
        } else {
          callback(null, null)
        }
      } catch (error) {
        callback(error, null)
      }
    })
  }

  setSavedAddress({ host, port, password }, callback) {
    this._setValue(KEYS.SAVED_ADDRESS, JSON.stringify({ host: host, port: port, password: password }), () => {
      callback({ host, port, password})
    })
  }

  getTheme(callback) {
    this._getValue(KEYS.CURRENT_THEME, (error, result) => {
      if (error != null) {
        callback(error, null)
      }

      callback(null, result)
    })
  }

  setTheme(name, callback) {
    this._setValue(KEYS.CURRENT_THEME, name, callback)
  }

  // Private.

  _getValue = async (key, callback) => {
    try {
      const result = await AsyncStorage.getItem(key)
      callback(null, result)
    } catch (error) {
      callback(error, null)
    }
  }

  _setValue = async (key, value, callback) => {
    try {
      await AsyncStorage.setItem(key, value)
      callback()
    } catch (error) {
       callback(error)
    }
  }
}

const _instance = new LocalStorage()

