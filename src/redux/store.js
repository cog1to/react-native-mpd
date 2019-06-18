import { createStore, applyMiddleware } from 'redux'

// Reducer.
import reducer from './reducer'

// Middlewares.
import { mpdMiddleware } from './middlewares/mpd'
import { albumArtMiddleware } from './middlewares/albumArt'
import { loggerMiddleware } from './middlewares/logger'
import { localStorageMiddleware } from './middlewares/localStorage'

export const configureStore = () => {
    const store = createStore(
        reducer,
        applyMiddleware(
            mpdMiddleware,
            albumArtMiddleware,
            localStorageMiddleware,
            //loggerMiddleware,
        )
     )

     return store
}
