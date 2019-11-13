import types from '../types'

import LocalStorage from '../../storage/LocalStorage'

import { addressLoaded, addressSaved, loadSavedAddress } from '../reducers/storage/actions'
import { artistArtLoaded } from '../reducers/artists/actions'

export const localStorageMiddleware = store => {
  return next => action => {
    switch (action.type) {
      case types.LOAD_SAVED_ADDRESS:
      {
        LocalStorage.instance().getSavedAddress((error, result) => {
          store.dispatch(addressLoaded(result, error))
        })
        break
      }
      case types.SAVE_ADDRESS:
      {
        LocalStorage.instance().setSavedAddress(action.data, (error) => {
          store.dispatch(addressSaved(action.data, error))
        })
        break
      }
      case types.ARTIST_ART_RECEIVED:
      {
        const { artist, urls, fromApi } = action
        if (fromApi && urls != null) {
          LocalStorage.instance().addArtistArt(artist, urls, () => {})
        }
        break
      }
      case types.LOAD_ARTIST_ART:
      {
        LocalStorage.instance().loadArtistArt((error, data) => {
          store.dispatch(artistArtLoaded(data))
        })
        break
      }
      default:
        break
    }
    return next(action)
  }
}

export default localStorageMiddleware
