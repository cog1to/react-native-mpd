import PropTypes from 'prop-types'

import * as types from './types'

// Archive doesn't really have a type, it's just a collection of artist name -> album name
// Each artist name may contain another dictionary with album name -> url.
const archivePropTypes = {	
}

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

			return {
				...state, ...newState
			}
		default:
			return state
	}
}
