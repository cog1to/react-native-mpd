import { createStore, applyMiddleware, combineReducers } from 'redux'

// Reducers.
import { archiveReducer } from './reducers/archive/reducer'
import { listenersReducer } from './reducers/listeners/reducer'
import { statusReducer } from './reducers/status/reducer'
import { currentSongReducer } from './reducers/currentsong/reducer'

// Middlewares.
import { mpdMiddleware } from './middlewares/mpd'
import { albumArtMiddleware } from './middlewares/albumArt'
import { loggerMiddleware } from './middlewares/logger'

const reducer = combineReducers({
	archive: archiveReducer,
	listeners: listenersReducer,
	status: statusReducer,
	currentSong: currentSongReducer,
})

export const configureStore = () => {
	const store = createStore(
		reducer,
		applyMiddleware(
			mpdMiddleware,
			albumArtMiddleware,
			loggerMiddleware,
		)
	)

	return store
}
