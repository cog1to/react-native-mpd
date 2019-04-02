import PropTypes from 'prop-types'

import * as types from './types'

const listenersPropTypes = {
	status: PropTypes.arrayOf(PropTypes.string),
	currentSong: PropTypes.arrayOf(PropTypes.string),
	progress: PropTypes.arrayOf(PropTypes.string),
}

const initialState = {
	status: [],
	currentSong: [],
	progress: [],
}

export const listenersReducer = (state = initialState, action) => {
	const { subsystem, id } = action
	let newState = Object.assign({}, state)

	switch (action.type) {
		case types.ADD_LISTENER:			
			if (!newState[subsystem].includes(id)) {
				console.log('*** adding listener ' + id + " for " + subsystem)
				newState[subsystem].push(id)
			}

			return newState
		case types.REMOVE_LISTENER:
			newState[subsystem] = newState[subsystem].filter(el => el !== id)
			return newState
		default:
			return state
	}
}