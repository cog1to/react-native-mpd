import * as types from './types'

const initialState = {
  address: null,
  error: null,
  mode: 'tiles',
  theme: 'Light'
}

export const storageReducer = (state = initialState, action) => {
  console.log("action == " + action.type)
  switch (action.type) {
    case types.LIBRARY_MODE_LOADED:
      return {
        ...state,
       mode: action.data,
       error: action.error,
      }
    case types.LIBRARY_MODE_SAVED:
      return {
        ...state,
        mode: action.data,
        error: action.error,
      }
    case types.ADDRESS_LOADED:
      return {
        ...state,
        address: action.data,
        error: action.error,
      }
    case types.ADDRESS_SAVED:
      return {
        ...state,
        address: action.data,
        error: action.error,
      }
    case types.THEME_CHANGED:
      return {
        ...state,
        theme: action.data
      }
    default:
      return state
  }
}
