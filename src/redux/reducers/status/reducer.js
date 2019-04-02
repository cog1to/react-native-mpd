import PropTypes from 'prop-types'

import * as types from './types'

const statusPropTypes = {
	connected: PropTypes.bool.isRequired,
	volume: PropTypes.number,
	duration: PropTypes.number,
	elapsed: PropTypes.number,
	songid: PropTypes.number,
	player: PropTypes.oneOf(['stop', 'play', 'pause']),
	error: PropTypes.node,
}

const initialState = {
	connected: false,
	volume: 0,
	duration: 0,
	elapsed : 0,
	songid: null,
	player: 'stop',
	error: null,
}

export const statusReducer = (state = initialState, action) => {
	switch (action.type) {
		case types.STATUS_UPDATED:
			return {				
				...state, ...action.status
			}
		case types.CONNECTED:
			return {
				...state, connected: action.connected
			}
		case types.CONNECTION_ERROR:
			return {
				...state, error: action.error
			}
		case types.ERROR:
			return {
				...state, error: action.error
			}
		default:
			return state
	}
}
