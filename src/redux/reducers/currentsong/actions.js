import * as types from './types'

export const currentSongUpdated = (data) => ({
	type: types.CURRENT_SONG_UPDATED,
	data: data,
})

export const getCurrentSong = () => ({
	type: types.GET_CURRENT_SONG,
})
