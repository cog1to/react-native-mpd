export * as types from './ActionTypes'
import MpdClientWrapper from '../utils/MpdClientWrapper'

const mpd = new MpdClientWrapper()

const initialState = {
	mpd: mpd,
	connected: false,
}

const clientReducer = (currentState = initialState, action) => {
	switch (action.type) {
		case types.STATUS_UPDATED:
			const { state, elapsed, duration, songid, volume } = action.status

			return {
				...currentState, state, elapsed, duration, songid, volume
			}
		case types.CONNECTION_ERROR:
			return {
				....currentState, connectionError: action.error
			}
		default:
			return currentState
	}
}

export default clientReducer
