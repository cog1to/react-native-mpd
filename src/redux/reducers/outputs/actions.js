import * as types from './types'

export const getOutputs = () => ({
  type: types.GET_OUTPUTS,
})

export const outputsUpdated = (outputs) => ({
  type: types.OUTPUTS_UPDATED,
  outputs: outputs,
})

export const disableOutput = (id) => ({
  type: types.DISABLE_OUTPUT,
  id,
})

export const enableOutput = (id) => ({
  type: types.ENABLE_OUTPUT,
  id,
})

