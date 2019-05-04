import PropTypes from 'prop-types'

import * as types from './types'

// Song prop types.
import { currentSongPropTypes } from '../currentsong/reducer'

export const queuePropTypes = PropTypes.arrayOf(PropTypes.shape(currentSongPropTypes)).isRequired

const initialState = []

export const queueReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.QUEUE_UPDATED:
            const { queue } = action
            return queue
        default:
            return state
    }
}
