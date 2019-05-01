import * as types from './types'

export const changeCurrentDir = (path) => ({
    type: types.CHANGE_CURRENT_DIR,
    path: path,
})

export const treeUpdated = (path, content) => ({
    type: types.TREE_UPDATED,
    path: path,
    content: content,
})

export const addToQueue = (uri, position, type) => ({
    type: types.ADD_TO_QUEUE,
    uri: uri,
    position: position,
    fileType: type,
})

export const addToQueuePlay = (uri, position) => ({
    type: types.ADD_TO_QUEUE_PLAY,
    uri: uri,
    position: position,
})

