import { createStore, applyMiddleware } from 'redux'

// Reducers.
import { clientReducer, initialState } from './ClientReducer'

// Middlewares.
import { mpdMiddleware } from './ClientMiddleware'
import { albumArtMiddleware } from './AlbumArtMiddleware'
import { loggerMiddleware } from '../logger/LoggerMiddleware'


export const configureStore = () => {
	const store = createStore(
		clientReducer,
		initialState,
		applyMiddleware(
			mpdMiddleware,
			albumArtMiddleware,
			loggerMiddleware,
		)
	)

	return store
}
