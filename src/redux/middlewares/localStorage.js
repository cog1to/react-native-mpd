import types from '../types'

import LocalStorage from '../../storage/LocalStorage'

import { addressLoaded, addressSaved } from '../reducers/storage/actions'

export const localStorageMiddleware = store => {
    return next => action => {
        switch (action.type) {
            case types.LOAD_SAVED_ADDRESS:
                LocalStorage.instance().getSavedAddress((error, result) => {
                    store.dispatch(addressLoaded(result, error))
                })
                break
            case types.SAVE_ADDRESS:
                LocalStorage.instance().setSavedAddress(action.data, (error) => {
                    store.dispatch(addressSaved(action.data, error))
                })
                break
        }
        return next(action)
    }
}

export default localStorageMiddleware
