import * as types from './types'

export const addListener = (subsystem, id) => ({
	type: types.ADD_LISTENER,
	subsystem: subsystem,
	id: id,
})

export const removeListener = (subsystem, id) => ({
	type: types.REMOVE_LISTENER,
	subsystem: subsystem,
	id: id,
})