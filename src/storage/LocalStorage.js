import { AsyncStorage } from 'react-native'

const KEYS = {
    SAVED_ADDRESS: 'SAVED_ADDRESS',
    CURRENT_THEME: 'CURRENT_THEME',
}

export default class LocalStorage {

    // Static stuff.

    static instance() {
        return _instance
    }

    // Public stuff.

    getSavedAddress(callback) {
        this._getValue(KEYS.SAVED_ADDRESS, (error, result) => {
            if (error != null) {
                callback(error, null)
                return
            }

            try {
                if (result != null) {
                    const address = JSON.parse(result)
                    callback(null, address)
                } else {
                    callback(null, null)
                }
            } catch (error) {
                callback(error, null)
            }
        })
    }

    setSavedAddress({ host, port }, callback) {
        this._setValue(KEYS.SAVED_ADDRESS, JSON.stringify({ host: host, port: port }), callback)
    }

    getTheme(callback) {
        this._getValue(KEYS.CURRENT_THEME, (error, result) => {
            if (error != null) {
                callback(error, null)
            }

            callback(null, result)
        })
    }

    setTheme(name, callback) {
        this._setValue(KEYS.CURRENT_THEME, name, callback)
    }

    // Private stuff.

    _getValue = async (key, callback) => {
        try {
            const result = await AsyncStorage.getItem(key)
            callback(null, result)
        } catch (error) {
            callback(error, null)
        }
    }

    _setValue = async (key, value, callback) => {
        try {
            await AsyncStorage.setItem(key, value)
        } catch (error) {
            callback(error)
        }
    }
}

const _instance = new LocalStorage()
