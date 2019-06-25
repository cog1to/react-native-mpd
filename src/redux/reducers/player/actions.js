import * as types from './types'

export const playPause = (state) => ({
    type: types.PLAY_PAUSE,
    state,
})

export const playNext = () => ({
    type: types.PLAY_NEXT,
})

export const playPrevious = () => ({
    type: types.PLAY_PREVIOUS,
})

export const seek = (position) => ({
    type: types.SEEK,
    position,
})

export const startProgressUpdate = () => ({
    type: types.START_PROGRESS_UPDATE,
})

export const stopProgressUpdate = () => ({
    type: types.STOP_PROGRESS_UPDATE,
})

export const setVolume = (volume) => ({
    type: types.SET_VOLUME,
    volume,
})
