import * as types from './types'

export const connect = (host, port, password = null) => ({
    type: types.CONNECT,
    host,
    port,
    password,
})

export const disconnect = () => ({
    type: types.DISCONNECT,
})

export const commands = () => ({
    type: types.COMMANDS,
})

export const commandsReceived = (commands) => ({
    type: types.COMMANDS_RECEIVED,
    commands,
})

export const connected = (status) => ({
    type: types.CONNECTED,
    connected: status
})

export const connectionError = (error) => ({
    type: types.CONNECTION_ERROR,
    error,
})

export const getStatus = (source) => ({
    type: types.GET_STATUS,
    source,
})

export const statusUpdated = (status, source) => ({
    type: types.STATUS_UPDATED,
    status,
    source,
})

export const getReplayGainStatus = () => ({
    type: types.GET_REPLAY_GAIN_STATUS,
})

export const replayGainStatusUpdated = (status) => ({
    type: types.REPLAY_GAIN_STATUS_UPDATED,
    status,
})

export const error = (error) => ({
    type: types.ERROR,
    error: error,
})
