import * as types from './types'

export const loadLibrary = () => ({
    type: types.LOAD_LIBRARY,
})

export const libraryLoaded = (content) => ({
    type: types.LIBRARY_LOADED,
    content: content,
})
