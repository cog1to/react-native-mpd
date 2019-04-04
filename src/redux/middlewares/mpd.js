import types from '../types'

import { connect, connected, connectionError, error, getStatus, statusUpdated } from '../reducers/status/actions'
import { getCurrentSong, currentSongUpdated } from '../reducers/currentsong/actions'
import { getQueue, queueUpdated } from '../reducers/queue/actions'
import { getAlbumArt } from '../reducers/archive/actions'

import MpdClientWrapper from '../../utils/MpdClientWrapper'

// MPD client singleton.
const client = {
	mpd: new MpdClientWrapper(),
	disconnects: [],
	progressTimeout: null,
	updatingProgress: false,
}

// Returns a handler function for player update events.
const handlePlayerUpdate = (store) => {
	return () => {
		store.dispatch(getStatus('status'))		
	}
}

const handleQueueUpdate = (store) => {
	return () => {
		store.dispatch(getQueue())
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

	if ('Id' in song) {
		state.songId = song.Id
	}

	console.log(JSON.stringify(state))

	return state
}

const statusToState = (status) => {
	const { state, elapsed = 0, duration = 0, songid = null, volume = 0 } = status
	return {				
		player: state, elapsed: parseFloat(elapsed), duration: parseFloat(duration), songid: songid, volume: parseFloat(volume)
	}
}

const queueToState = (queue) => {
	return queue.map((element) => {
		return songToState(element)
	})
}

export const mpdMiddleware = store => {	
	return next => action => {
		switch (action.type) {
			case types.CONNECT:
				client.mpd.connect(action.host, action.port).then(() => {
					// Subscribe to player events.
					client.disconnects.push(client.mpd.onPlayerUpdate(handlePlayerUpdate(store)))

					// Subscribe to queue events.
					client.disconnects.push(client.mpd.onQueueUpdate(handleQueueUpdate(store)))

					// Emit connected action.
					store.dispatch(connected(true))
					store.dispatch(getStatus('status'))
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
					const newState = statusToState(status)
					store.dispatch(statusUpdated(newState, action.source))
				}).catch((e) => {
					store.dispatch(error(e, types.GET_STATUS))
				})
				break

			case types.STATUS_UPDATED:
				if (action.source === 'progress' && client.updatingProgress) {
					client.progressTimeout = setTimeout(() => store.dispatch(getStatus('progress')), 1000)
				}

				if (action.status.songid != store.getState().status.songid) {
					store.dispatch(getCurrentSong())
				}

				if (store.getState().queue.length == 0) {
					store.dispatch(getQueue())
				}

				break

			case types.GET_CURRENT_SONG:
				client.mpd.getCurrentSong().then((result) => {
					let song = songToState(result)
					store.dispatch(currentSongUpdated(song))
				}).catch((e) => {
					store.dispatch(error(e, types.GET_CURRENT_SONG))
				})
				break

			case types.CURRENT_SONG_UPDATED:
				const { album, artist, albumArtist } = action.data
				const nextArtist = (albumArtist ? albumArtist : artist)
				const archive = store.getState().archive
				
				if (album !== null && nextArtist !== null) {
					if (!(nextArtist in archive) || !(album in archive[nextArtist])) {
						store.dispatch(getAlbumArt(nextArtist, album))
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

			case types.GET_QUEUE:
				client.mpd.getQueue().then((result) => {
					let queue = queueToState(result)
					store.dispatch(queueUpdated(queue))
				}).catch((e) => {
					store.dispatch(error(e, types.GET_QUEUE))
				})				
				break

			case types.SET_CURRENT_SONG:
				client.mpd.setCurrentSong(action.songId)
				break

			case types.START_PROGRESS_UPDATE:
				if (!client.updatingProgress) {
					client.updatingProgress = true
					store.dispatch(getStatus('progress'))
				}
				break

			case types.STOP_PROGRESS_UPDATE:
				client.updatingProgress = false
				if (client.progressTimeout !== null) {
					clearTimeout(client.progressTimeout)
				}

				break

			default:
				break
		}

		return next(action)
	}
}

export default mpdMiddleware
