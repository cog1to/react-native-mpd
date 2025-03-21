import { createStore, applyMiddleware } from 'redux'

// Reducer.
import reducer from './reducer'

// Middlewares.
import { mpdMiddleware } from './middlewares/mpd'
import { albumArtMiddleware } from './middlewares/albumArt'
import { artistArtMiddleware } from './middlewares/artistArt'
import { loggerMiddleware } from './middlewares/logger'
import { localStorageMiddleware } from './middlewares/localStorage'
import { stubMiddleware } from './middlewares/stub'

export const configureStore = () => {
  const store = createStore(
    reducer,
    applyMiddleware(
      stubMiddleware,
      mpdMiddleware,
      albumArtMiddleware,
      localStorageMiddleware,
      artistArtMiddleware,
    )
  )

  return store
}

const store = configureStore()

export default store

