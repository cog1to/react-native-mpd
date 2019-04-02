import * as playerTypes from '../reducers/player/types'

import * as statusTypes from '../reducers/status/types'
import { connect, connected, connectionError, error, getStatus, statusUpdated } from '../reducers/status/actions'

import * as currentSongTypes from '../reducers/currentsong/types'
import { getCurrentSong, currentSongUpdated } from '../reducers/currentsong/actions'

import * as listenerTypes from '../reducers/listeners/types'

import MpdClientWrapper from '../../utils/MpdClientWrapper'

// MPD client singleton.
const client = {
	mpd: new MpdClientWrapper(),
	disconnects: [],
	progressTimeout: null,
}

// Returns a handler function for player update events.
const handlePlayerUpdate = (store) => {
	return () => {
		if (store.getState().listeners.currentSong.length > 0) {
			store.dispatch(getCurrentSong())
		}

		if (store.getState().listeners.status.length > 0) {
			store.dispatch(getStatus('status'))
		}
	}
}

const songToState = (song) => {
	let state = {
		file: null,
		title: null,
		artist: null,
		album: null,
		abumArtist: null,
		songId: null,
	}

	if ('Artist' in song) {
		state.artist = song.Artist
	}

	if ('Album' in song) {
		state.album = song.Album
	}

	if ('AlbumArtist' in song) {
		state.artist = song.AlbumArtist
	}

	if ('Title' in song) {
		state.title = song.Title
	}

	if ('file' in song) {
		state.file = song.file
	}

	if ('SongId' in song) {
		state.songId = song.SongId
	}

	return state
}

const statusToState = (status) => {
	const { state, elapsed = 0, duration = 0, songid = null, volume = 0 } = status
	return {				
		player: state, elapsed: parseFloat(elapsed), duration: parseFloat(duration), songid: songid, volume: parseFloat(volume)
	}
}

export const mpdMiddleware = store => {	
	return next => action => {
		switch (action.type) {
			case statusTypes.CONNECT:
				client.mpd.connect(action.host, action.port).then(() => {
					// Subscribe to player events.
					client.disconnects.push(client.mpd.onPlayerUpdate(handlePlayerUpdate(store)))

					// Emit connected action.
					store.dispatch(connected(true))
				}).catch((error) => {
					store.dispatch(connectionError(error))
				})
				break

			case statusTypes.DISCONNECT:
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

			case statusTypes.GET_STATUS:
				client.mpd.getStatus().then((status) => {
					const newState = statusToState(status)
					store.dispatch(statusUpdated(newState, action.source))
				}).catch((e) => {
					store.dispatch(error(e, types.GET_STATUS))
				})
				break

			case statusTypes.STATUS_UPDATED:
				if (action.source === 'progress' && store.getState().listeners.progress.length > 0) {
					client.progressTimeout = setTimeout(() => store.dispatch(getStatus('progress')), 1000)
				}

				break

			case currentSongTypes.GET_CURRENT_SONG:
				client.mpd.getCurrentSong().then((result) => {
					let song = songToState(result)
					store.dispatch(currentSongUpdated(song))
				}).catch((e) => {
					store.dispatch(error(e, currentSongTypes.GET_CURRENT_SONG))
				})				
				break

			case playerTypes.PLAY_PAUSE:
				const { state } = action

				if (state === 'play') {
					client.mpd.play()
				} else {
					client.mpd.pause()
				}
				break

			case playerTypes.PLAY_NEXT:
				client.mpd.next()
				break

			case playerTypes.PLAY_PREVIOUS:
				client.mpd.previous()
				break

			case playerTypes.SEEK:
				client.mpd.seek(action.position)
				break

			case listenerTypes.ADD_LISTENER:
				if (!store.getState().listeners[action.subsystem].includes(action.id)) {
					if (action.subsystem === listenerTypes.SUBSYSTEMS.CURRENT_SONG) {
						store.dispatch(getCurrentSong())
					} else if (action.subsystem === listenerTypes.SUBSYSTEMS.STATUS) {
						store.dispatch(getStatus('status'))
					} else if (action.subsystem === listenerTypes.SUBSYSTEMS.PROGRESS) {
						store.dispatch(getStatus('progress'))
					}
				}
				break
			default:
				break
		}

		return next(action)
	}
}

export default mpdMiddleware
