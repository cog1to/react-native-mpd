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

