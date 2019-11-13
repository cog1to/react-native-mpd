import * as types from './types'

export const getArtistArt = (artist) => ({
  type: types.GET_ARTIST_ART,
  artist,
})

export const artistArtReceived = (artist, urls, fromApi) => ({
  type: types.ARTIST_ART_RECEIVED,
  artist,
  urls,
  fromApi,
})

export const loadArtistArt = () => ({
  type: types.LOAD_ARTIST_ART,
})

export const artistArtLoaded = (data) => ({
  type: types.ARTIST_ART_LOADED,
  data: data,
})

