import * as types from './types'

export const getPlaylists = () => ({
    type: types.GET_PLAYLISTS,
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

