import * as types from '../reducers/artists/types'

import { getArtistArt, artistArtReceived } from '../reducers/artists/actions'
import Discogs from '../../api/Discogs'

// Since Discogs has rate limiting, we persist the singletone instance of API handler here.
const api = new Discogs()

export const artistArtMiddleware = store => {
  return next => action => {
    switch (action.type) {
      case types.GET_ARTIST_ART:
        const { artist } = action
        const { artists } = store.getState()

        if (artist in artists) {
          // We already have the response.
          store.dispatch(artistArtReceived(artist, artists[artist], false))
        } else {
          // Don't trigger update if we have no valid data for search
          if (artist == null || artist.length == 0 || artist == 'VA') {
            break
          }

          api.getArtistUrls(artist, (urls) => {
            store.dispatch(artistArtReceived(artist, urls, true))
          }, error => {
            console.log('Failed to load artist image: ' + error)
          })
        }
        break
      default:
        break
    }
    return next(action)
  }
}

export default artistArtMiddleware

