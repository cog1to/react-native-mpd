import * as types from './types'

export const getQueue = () => ({
	type: types.GET_QUEUE,
})

export const queueUpdated = (queue) => ({
	type: types.QUEUE_UPDATED,
	queue,
})

export const setCurrentSong = (songId) => ({
	type: types.SET_CURRENT_SONG,
	songId,
})