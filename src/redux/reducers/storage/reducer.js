import * as types from './types'

const initialState = {
    address: null,
    error: null,
}

export const storageReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.ADDRESS_LOADED:
            return {
                address: action.data,
                error: action.error,
            }
        case types.ADDRESS_SAVED:
            return {
                address: action.data,
                error: action.error,
            }
        default:
            return state
    }
}
