import PropTypes from 'prop-types'

import * as types from './types'

const statusPropTypes = {
    connected: PropTypes.bool.isRequired,
    volume: PropTypes.number,
    duration: PropTypes.number,
    elapsed: PropTypes.number,
    songid: PropTypes.number,
    player: PropTypes.oneOf(['stop', 'play', 'pause']),
    error: PropTypes.node,
    replayGain: PropTypes.string,
    commands: PropTypes.array,
    intentional: PropTypes.bool,
    attempt: PropTypes.number,
}

const initialState = {
    connected: false,
    volume: 0,
    duration: 0,
    elapsed : 0,
    songid: null,
    player: 'stop',
    error: null,
    replayGain: 'off',
    commands: null,
    intentional: null,
    attempt: 0,
}

export const statusReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.STATUS_UPDATED:
            return {                                
                ...state, ...action.status
            }
        case types.SET_INTENTIONAL:
            return {
                ...state, 
                intentional: action.value,
                connectionError: null,
                attempt: 0,
            }
        case types.CONNECTED:
            return {
                ...state, 
                connected: action.connected,
                commands: action.connected ? state.commands : null,
                connectionError: null,
                intentional: action.connected ? false : state.intentional,
                attempt: action.connected ? 0 : state.attempt,
            }
        case types.CONNECTION_ERROR:
            return {
                ...state,
                error: action.error,
                attempt: action.attempt + 1,
            }
        case types.ERROR:
            return {
                ...state, error: action.error
            }
        case types.REPLAY_GAIN_STATUS_UPDATED:
            console.log(action)
            return {
                ...state, replayGain: action.status.replay_gain_mode
            }
        case types.COMMANDS_RECEIVED:
            return {
                ...state, commands: action.commands
            }
        default:
            return state
    }
}
