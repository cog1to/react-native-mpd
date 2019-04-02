import * as types from './types'

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
