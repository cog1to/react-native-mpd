import PropTypes from 'prop-types'

import * as types from './types'

export const artistsReducer = (state = {}, action) => {
  switch (action.type) {
    case types.ARTIST_ART_RECEIVED:
      const { artist, urls } = action

      let newState = Object.assign({}, state)

      // If list does not contain an artist, initialize a new dictionary for it.
      if (!(artist in newState)) {
        newState[artist] = { }
      }

      // Add art URLs for artist.
      newState[artist] = urls

      return newState
    case types.ARTIST_ART_LOADED:
      const { data } = action
      if (data != null) {
        return data
      }
    default:
      return state
  }
}

