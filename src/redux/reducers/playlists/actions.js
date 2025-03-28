import * as types from './types'

export const getPlaylists = () => ({
  type: types.GET_PLAYLISTS,
})

export const addToPlaylist = (name, paths) => ({
  type: types.ADD_TO_PLAYLIST,
  name,
  paths,
})

export const loadingPlaylists = (loading) => ({
  type: types.PLAYLISTS_LOADING,
  loading,
})

export const playlistsLoaded = (data) => ({
  type: types.PLAYLISTS_LOADED,
  data,
})

export const getPlaylist = (name) => ({
  type: types.GET_PLAYLIST,
  name,
})

export const loadingPlaylist = (loading) => ({
  type: types.PLAYLIST_LOADING,
  loading,
})

export const playlistLoaded = (name, data) => ({
  type: types.PLAYLIST_LOADED,
  name,
  data,
})

export const deletePlaylists = (names) => ({
  type: types.DELETE_PLAYLISTS,
  names,
})

export const playlistMove = (name, from, to) => ({
  type: types.PLAYLIST_MOVE,
  name,
  from,
  to,
})

export const playlistDelete = (name, indices) => ({
  type: types.PLAYLIST_DELETE,
  name,
  indices,
})
