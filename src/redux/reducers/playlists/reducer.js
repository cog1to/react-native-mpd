import * as types from './types'

const initialState = {
    loading: false,
    playlists: null,
}

export const playlistsReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.PLAYLISTS_LOADING:
            return {
                ...state,
                loading: action.loading,
            }
        case types.PLAYLISTS_LOADED:
            return {
                playlists: action.data,
                loading: false,
            }
        case types.PLAYLIST_LOADING:
            return {
                ...state,
                loading: action.loading,
            }
        case types.PLAYLIST_LOADED:
            let newState = Object.assign({}, state)

            let playlist = (newState.playlists != null)
                ? newState.playlists.find(element => { return element.name === action.name })
                : {}
            playlist.tracks = action.data

            newState.loading = false
            return newState
        default:
            return state
    }
}
 
