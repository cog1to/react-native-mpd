import * as types from './ActionTypes'
import * as updateTypes from './UpdateTypes'

import { connected, getStatus, connectionError, currentSongUpdated, error, getCurrentSong, statusUpdated } from './Actions'

import MpdClientWrapper from '../../utils/MpdClientWrapper'

// MPD client singleton.
const client = {
	mpd: new MpdClientWrapper(),
	listeners: {},
	disconnects: [],
	progressListener: null,
}

// Returns a handler function for player update events.
const handlePlayerUpdate = (store) => {
	return () => {
		if (client.listeners[updateTypes.CURRENT_SONG] !== null && client.listeners[updateTypes.CURRENT_SONG].length > 0) {
			store.dispatch(getCurrentSong())
		}

		if (client.listeners[updateTypes.STATUS] !== null && client.listeners[updateTypes.STATUS].length > 0) {
			store.dispatch(getStatus(updateTypes.STATUS))
		}
	}
}

export const mpdMiddleware = store => {	
	return next => action => {
		switch (action.type) {
			case types.CONNECT:
				client.mpd.connect(action.host, action.port).then(() => {
					// Subscribe to player events.
					client.disconnects.push(client.mpd.onPlayerUpdate(handlePlayerUpdate(store)))

					// Emit connected action.
					store.dispatch(connected(true))
				}).catch((error) => {
					store.dispatch(connectionError(error))
				})
				break

			case types.DISCONNECT:
				client.mpd.disconnect().then(() => {
					// Unsubscribe from all events.
					client.disconnects.forEach((callback) => {
						callback()
					})

					// Emit disconnected action.
					store.dispatch(connected(false))
				}).catch((error) => {
					store.dispatch(connectionError(error))
				})
				break

			case types.GET_STATUS:
				client.mpd.getStatus().then((status) => {
					store.dispatch(statusUpdated(status, action.source))
				}).catch((e) => {
					store.dispatch(error(e, types.GET_STATUS))
				})
				break

			case types.STATUS_UPDATED:
				if (action.source === updateTypes.PROGRESS) {
					if (updateTypes.PROGRESS in client.listeners && client.listeners[updateTypes.PROGRESS].length > 0) {
						client.progressListener = setTimeout(() => {store.dispatch(getStatus(action.source))}, 1000)
					}
				}
				
				break

			case types.GET_CURRENT_SONG:
				client.mpd.getCurrentSong().then((song) => {
					store.dispatch(currentSongUpdated(song))
				}).catch((e) => {
					store.dispatch(error(e, types.GET_CURRENT_SONG))
				})				
				break

			case types.LISTEN_FOR:
				const { data, active, id } = action

				// Add new listener.
				if (active) {
					// Initialize listeners list if needed.
					if (client.listeners[data] == null) {
						client.listeners[data] = []
					}

					// Push new listener to the list only if it's not already added.
					if (client.listeners[data].filter(el => el === id).length == 0) {
						client.listeners[data].push(id)
					} else {
						break
					}

					// Trigger immediate update.
					switch (data) {
						case updateTypes.CURRENT_SONG:
							store.dispatch(getCurrentSong())
						case updateTypes.STATUS:
							store.dispatch(getStatus(data))
						case updateTypes.PROGRESS:
							store.dispatch(getStatus(data))
						default:
							break
					}					
				} else {
					if (data in client.listeners) {
						client.listeners[data] = client.listeners[data].filter(el => el != id)
					}

					// For progress we also have to cancel the update timer.
					if (data === updateTypes.PROGRESS && client.progressListener !== null) {
						clearTimeout(client.progressListener)
						client.progressListener = null
					}
				}
				break

			case types.PLAY_PAUSE:
				const { state } = action

				if (state === 'play') {
					client.mpd.play()
				} else {
					client.mpd.pause()
				}
				break

			case types.PLAY_NEXT:
				client.mpd.next()
				break

			case types.PLAY_PREVIOUS:
				client.mpd.previous()
				break

			case types.SEEK:
				client.mpd.seek(action.position)
				break

			default:
				break
		}

		return next(action)
	}
}

export default mpdMiddleware
