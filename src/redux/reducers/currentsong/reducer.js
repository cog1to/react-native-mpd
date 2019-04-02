import PropTypes from 'prop-types'

import * as types from './types'

const currentSongPropTypes = {
	file: PropTypes.string,
	title: PropTypes.string,
	artist: PropTypes.string,
	album: PropTypes.string,
	abumArtist: PropTypes.string,
}

const initialState = {
	file: null,
	title: null,
	artist: null,
	album: null,
	abumArtist: null,
}

export const currentSongReducer = (state = initialState, action) => {
	switch (action.type) {
		case types.CURRENT_SONG_UPDATED:
			return action.data
		default:
			return state
	}
}
