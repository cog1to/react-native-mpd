import * as types from './types'

const initialState = {
    loading: false,
    library: null,
}

export const libraryReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.ARTISTS_LOADED: {
            let library = {}

            action.content.forEach(element => {
                library[element["Artist"]] = null
            })

            return {
                loading: false,
                library,
            }
        }
        case types.ALBUMS_LOADED: {
            const { artist, content: albums } = action

            let existingArtist = (state.library != null) ? state.library[artist] : {}
            if (existingArtist == null) {
                existingArtist = {}
            }

            albums.forEach(element => {
                existingArtist[element["Album"]] = null
            })
            
            const newState = Object.assign({}, state)
            newState.library[artist] = existingArtist
            newState.loading = false

            return newState
        }
        case types.SONGS_LOADED: {
            const { artist, album, content: songs } = action

            let existingArtist = (state.library != null) ? state.library[artist] : {}
            if (existingArtist == null) {
                existingArtist = {}
            }

            existingArtist[album] = songs
            newState = Object.assign({}, state)
            newState.library[artist] = existingArtist
            newState.loading = false

            return newState
        }
        case types.SET_LIBRARY_LOADING: {
            return {
                ...state,
                loading: action.loading,
            }
        }
        default:
            return state
    }
}
