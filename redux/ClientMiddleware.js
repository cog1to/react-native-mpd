export * as types from './ActionTypes'
export { connected } from './Actions'
import MpdClientWrapper from '../utils/MpdClientWrapper'

const mpdMiddleware = store => {
	const { mpd } = store

	return next => action => {
		switch (action.type) {
			case types.CONNECT:
				mpd.connect(action.host, action.port).then(() => {
					store.dispatch(connected())
				}).catch((error) => {
					store.dispatch(connectionError(error))
				})
		}

		return next(action)
	}
}

export default mpdMiddleware
