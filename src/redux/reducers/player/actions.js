import * as types from './types'

export const playPause = (state) => ({
	type: types.PLAY_PAUSE,
	state,
})

export const playNext = () => ({
	type: types.PLAY_NEXT,
})

export const playPrevious = () => ({
	type: types.PLAY_PREVIOUS,
})

export const seek = (position) => ({
	type: types.SEEK,
	position,
})
