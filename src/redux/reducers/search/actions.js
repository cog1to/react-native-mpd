import * as types from './types'

export const search = (expression) => ({
  type: types.SEARCH,
  expression: expression,
})

export const searchUpdated = (results) => ({
  type: types.SEARCH_UPDATED,
  results: results,
})
