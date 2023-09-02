import * as types from './types'

export const changeCurrentDir = (path, force) => ({
  type: types.CHANGE_CURRENT_DIR,
  path: path,
  force: force,
})

export const treeUpdated = (path, content) => ({
  type: types.TREE_UPDATED,
  path: path,
  content: content,
})

export const addToQueue = (items, position) => ({
  type: types.ADD_TO_QUEUE,
  position: position,
  items: items,
})

export const addToQueuePlay = (uri, position) => ({
  type: types.ADD_TO_QUEUE_PLAY,
  uri: uri,
  position: position,
})

export const setRefreshing = (refreshing) => ({
  type: types.SET_REFRESHING,
  refreshing,
})
