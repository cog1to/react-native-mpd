import * as types from './types'

const initialState = null

export const libraryReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.LIBRARY_LOADED: {
            return action.content
        }
        case types.ARTISTS_LOADED: {
            let library = {}

            action.content.forEach(element => {
                library[element["Artist"]] = null
            })

            return library
        }
        case types.ALBUMS_LOADED: {
            const { artist, content: albums } = action

            let existingArtist = (state != null) ? state[artist] : {}
            if (existingArtist == null) {
                existingArtist = {}
            }

            albums.forEach(element => {
                existingArtist[element["Album"]] = null
            })
            
            const newState = Object.assign({}, state)
            newState[artist] = existingArtist

            return newState
        }
        case types.SONGS_LOADED: {
            const { artist, album, content: songs } = action

            let existingArtist = (state != null) ? state[artist] : {}
            if (existingArtist == null) {
                existingArtist = {}
            }

            existingArtist[album] = songs
            newState = Object.assign({}, state)
            newState[artist] = existingArtist

            return newState
        }
        default:
            return state
    }
}
