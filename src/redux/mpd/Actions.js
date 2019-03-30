import * as types from './ActionTypes'

export const connect = (host, port) => ({
	type: types.CONNECT,
	host,
	port,
})

export const connected = (status) => ({
	type: types.CONNECTED,
	connected: status
})

export const connectionError = (error) => ({
	type: types.CONNECTION_ERROR,
	error,
})

export const getStatus = (source) => ({
	type: types.GET_STATUS,
	source,
})

export const statusUpdated = (status, source) => ({
	type: types.STATUS_UPDATED,
	status,
	source,
})

export const listenFor = (data, id, active) => ({
	type: types.LISTEN_FOR,
	id: id,
	data: data,
	active: active,
})

export const currentSongUpdated = (data) => ({
	type: types.CURRENT_SONG_UPDATED,
	data: data,
})

export const getCurrentSong = () => ({
	type: types.GET_CURRENT_SONG,
})

export const error = (error, action) => ({
	type: types.ERROR,
	error: error,
	action: action,
})

export const getAlbumArt = (artist, album) => ({
	type: types.GET_ART,
	artist,
	album,
})

export const albumArtReceived = (artist, album, url) => ({
	type: types.ART_RECEIVED,
	artist,
	album,
	url,
})

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