import * as types from './types'

export const libraryReducer = (state = null, action) => {
    switch (action.type) {
        case types.LIBRARY_LOADED:
            return action.content
        default:
            return state
    }
}
