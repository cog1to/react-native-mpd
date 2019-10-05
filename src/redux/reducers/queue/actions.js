import * as types from './types'

export const getQueue = () => ({
    type: types.GET_QUEUE,
})

export const queueUpdated = (queue) => ({
    type: types.QUEUE_UPDATED,
    queue,
})

export const setCurrentSong = (songId) => ({
    type: types.SET_CURRENT_SONG,
    songId,
})

export const deleteSongs = (songIds) => ({
    type: types.DELETE_SONGS,
    songIds,
})

export const clear = () => ({
    type: types.CLEAR_QUEUE,
})

export const moveSong = (id, to) => ({
    type: types.MOVE_SONG,
    id,
    to,
})
