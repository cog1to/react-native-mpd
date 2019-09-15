import PropTypes from 'prop-types'

import * as types from './types'

export const archiveReducer = (state = {}, action) => {
    switch (action.type) {
        case types.ART_RECEIVED:
            const { artist, album, url } = action

            let newState = Object.assign({}, state)

            // If list does not contain an artist, initialize a new dictionary for it.
            if (!(artist in newState)) {
                newState[artist] = { }
            }

            // Add an URL for artist->album.
            newState[artist][album] = action.url

            return newState
        default:
            return state
    }
}

