import * as types from './types'

export const outputsReducer = (state = [], action) => {
  switch (action.type) {
    case types.OUTPUTS_UPDATED:
      const { outputs } = action
      return outputs
    default:
      return state
  }
}

