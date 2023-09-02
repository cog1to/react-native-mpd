import * as types from './types'

export const loadSavedAddress = () => ({
  type: types.LOAD_SAVED_ADDRESS,
})

export const addressLoaded = (address, error) => ({
  type: types.ADDRESS_LOADED,
  data: address,
  error: error,
})

export const saveAddress = (address) => ({
  type: types.SAVE_ADDRESS,
  data: address,
})

export const addressSaved = (address, error) => ({
  type: types.ADDRESS_SAVED,
  data: address,
  error: error,
})

export const loadLibraryMode = () => ({
  type: types.LOAD_LIBRARY_MODE,
})

export const libraryModeLoaded = (mode, error) => ({
  type: types.LIBRARY_MODE_LOADED,
  data: mode,
  error: error,
})

export const saveLibraryMode = (mode) => ({
  type: types.SAVE_LIBRARY_MODE,
  data: mode,
})

export const libraryModeSaved = (mode, error) => ({
  type: types.LIBRARY_MODE_SAVED,
  data: mode,
  error: error,
})

export const saveTheme = (theme) => ({
  type: types.SAVE_THEME,
  data: theme,
})

export const themeChanged = (theme) => ({
  type: types.THEME_CHANGED,
  data: theme
})
