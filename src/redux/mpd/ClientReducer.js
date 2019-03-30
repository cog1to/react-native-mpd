import * as types from './ActionTypes'

const initialState = {
	connected: false,
	currentSong: null,
	archive: {}
}

export const clientReducer = (currentState = initialState, action) => {
	switch (action.type) {
		case types.STATUS_UPDATED:
			const { state, elapsed = 0, duration = 0, songid, volume } = action.status
			return {				
				...currentState, state: state, elapsed: parseFloat(elapsed), duration: parseFloat(duration), songid: songid, volume: parseFloat(volume)
			}
		case types.CURRENT_SONG_UPDATED:
			return {
				...currentState, currentSong: action.data
			}
		case types.CONNECTION_ERROR:
			return {
				...currentState, connectionError: action.error
			}
		case types.CONNECTED:
			return {
				...currentState, connected: action.connected
			}
		case types.ART_RECEIVED:
			const { artist, album, url } = action

			// Extract current art list.
			const { archive } = currentState
			
			// If list does not contain an artist, initialize a new dictionary for it.
			if (!(artist in archive)) {
				archive[artist] = {}
			}

			// Add an URL for artist->album.
			archive[artist][album] = action.url

			return {
				...currentState, archive
			}
		default:
			return currentState
	}
}

export default clientReducer
