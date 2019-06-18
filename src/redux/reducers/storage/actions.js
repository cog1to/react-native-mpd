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
