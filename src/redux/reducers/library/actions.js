import * as types from './types'

export const loadArtists = () => ({
    type: types.LOAD_ARTISTS,
})

export const artistsLoaded = (content) => ({
    type: types.ARTISTS_LOADED,
    content: content,
})

export const loadAlbums = (artist) => ({
    type: types.LOAD_ALBUMS,
    artist,
})

export const albumsLoaded = (artist, content) => ({
    type: types.ALBUMS_LOADED,
    artist,
    content,
})

export const loadSongs = (artist, album) => ({
    type: types.LOAD_SONGS,
    artist,
    album,
})

export const songsLoaded = (artist, album, content) => ({
    type: types.SONGS_LOADED,
    artist,
    album,
    content,
})
