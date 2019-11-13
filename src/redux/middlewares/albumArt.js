import * as types from '../reducers/archive/types'

import { getAlbumArt, albumArtReceived } from '../reducers/archive/actions'

import CoverArtArchive from '../../api/CoverArtArchive'
import LastFM from '../../api/LastFM'

export const albumArtMiddleware = store => {
  return next => action => {
    switch (action.type) {
      case types.GET_ART:
        const { artist, album } = action
        const { archive } = store.getState()

        if (artist in archive && album in archive[artist]) {
          // We already have the response.
          store.dispatch(albumArtReceived(artist, album, archive[artist][album]))
        } else {
          // Don't trigger update if we have no valid data for search
          if (artist == null || album == null || artist.length == 0 || album.length == 0) {
            break
          }

          const api = new LastFM()
          let promise = api.getArtUrl(artist, album)
          .then((url) => {
            store.dispatch(albumArtReceived(artist, album, url))
          })
          .catch(error => {
            console.log('Failed to get album art: ' + error)
          })
        }
        break
      default:
        break
    }
    return next(action)
  }
}

export default albumArtMiddleware

