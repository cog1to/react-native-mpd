import * as types from './types'

const initialState = null

export const searchReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.SEARCH_UPDATED:
            const { results } = action
            return results
        default:
            return state
    }
}
