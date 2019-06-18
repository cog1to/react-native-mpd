import types from '../types'

import { connect, connected, connectionError, error, getStatus, statusUpdated } from '../reducers/status/actions'
import { getCurrentSong, currentSongUpdated } from '../reducers/currentsong/actions'
import { getQueue, queueUpdated } from '../reducers/queue/actions'
import { getAlbumArt } from '../reducers/archive/actions'
import { changeCurrentDir, treeUpdated, addToQueue } from '../reducers/browser/actions'
import { searchUpdated } from '../reducers/search/actions'
import { artistsLoaded, albumsLoaded, songsLoaded } from '../reducers/library/actions'
import { saveAddress } from '../reducers/storage/actions'

import MpdClientWrapper from '../../utils/MpdClientWrapper'

import { TreeNodeType } from '../reducers/browser/reducer'

import { sanitize } from '../../utils/StringUtils'

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

// Returns a handler function for queue update events.
const handleQueueUpdate = (store) => {
    return () => {
        store.dispatch(getQueue())
    }
}

// Returns a handler function for error events.
const handleErrorUpdate = (store) => {
    return (err) => {
        store.dispatch(error(err))
    }
}

const handleClose = (store) => {
    return () => {
        store.dispatch(connected(false))
    }
}

const songToState = (song) => {
    const {
        Artist: artist = null,
        Album: album = null,
        AlbumArtist: albumArtist = null,
        Title: title = null,
        Id: songId = null,
        Pos: position = null,
        file: file = null,
    } = song

    return {
        artist: artist,
        album: album,
        albumArtist: albumArtist,
        title: title,
        songId: songId,
        file: file,
        position: parseFloat(position)
    }
}

const statusToState = (status) => {
    const { state, elapsed = 0, duration = 0, songid = null, volume = 0 } = status
    return {
        player: state, elapsed: parseFloat(elapsed), duration: parseFloat(duration), songid: songid, volume: parseFloat(volume)
    }
}

const queueToState = (queue, withId) => {
    return queue.filter(el => { return !withId || el.Id != null }).map((element) => {
        return songToState(element)
    })
}

const listToChildren = (list) => {
    return list.filter((el) => ('directory' in el || 'file' in el || 'playlist' in el)).map((element) => {
        let node = {}

        let filename = null
        if ('directory' in element) {
            filename = element.directory
            node.type = TreeNodeType.DIRECTORY
        } else if ('file' in element) {
            filename = element.file
            node.type = TreeNodeType.FILE
            node.title = element.Title
            node.artist = element.Artist
        } else if ('playlist' in element) {
            filename = element.playlist
            node.type = TreeNodeType.PLAYLIST
        }

        let pathComponents = filename.split('/')
        node.name = pathComponents[pathComponents.length-1]

        node.fullPath = filename
        node.children = []

        return node
    })
}

const nodeFromPath = (path, tree) => {
    let node = tree

    if (node === null) {
        return null
    }

    if (path.length < 2 && path[0] == node.name) {
        return node
    }

    path.slice(1).forEach((element) => {
        node = node.children.filter((child) => child.name === element)[0]
    })

    return node
}

async function getContentRecursively(uri) {
    let nodes = listToChildren(await client.mpd.getList(uri))

    let results = []
    for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index]
        switch (node.type) {
            case TreeNodeType.FILE:
                results.push(node)
                break
            case TreeNodeType.DIRECTORY:
                let children = await getContentRecursively(node.fullPath)
                children.forEach(file => { results.push(file) })
                break
            case TreeNodeType.PLAYLIST:
                break
            default:
                break
        }
    }

    return results
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

                    // Subscribe to error events.
                    client.disconnects.push(client.mpd.onError(handleErrorUpdate(store)))

                    // Subsccribe to close events.
                    client.disconnects.push(client.mpd.onDisconnected(handleClose(store)))

                    // Emit connected action.
                    store.dispatch(connected(true))
                    store.dispatch(saveAddress({ host: action.host, port: action.port }))
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

            case types.CURRENT_SONG_UPDATED: {
               const { album, artist, albumArtist } = action.data
               const nextArtist = (albumArtist ? albumArtist : artist)
               const archive = store.getState().archive

               if (album !== null && nextArtist !== null) {
                   if (!(nextArtist in archive) || !(album in archive[nextArtist])) {
                       store.dispatch(getAlbumArt(nextArtist, album))
                   }
               }
               break
            }
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
                    let queue = queueToState(result, true)
                    store.dispatch(queueUpdated(queue))
                }).catch((e) => {
                    store.dispatch(error(e, types.GET_QUEUE))
                })
                break

            case types.SET_CURRENT_SONG:
                client.mpd.setCurrentSong(action.songId)
                break

            case types.DELETE_SONGS:
                action.songIds.reduce((promiseChain, songId) => {
                    return promiseChain.then(client.mpd.deleteSongId(songId))
                }, Promise.resolve())
                break

            case types.CLEAR_QUEUE:
                client.mpd.clear().catch((e) => {
                    store.dispatch(error(e, types.CLEAR_QUEUE))
                })
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

            case types.CHANGE_CURRENT_DIR:
                const { tree } = store.getState().browser

                let node = nodeFromPath(action.path, tree)
                if (node !== null && node.children.length > 0) {
                    store.dispatch(treeUpdated(action.path, node.children))
                } else {
                    const path = action.path.length < 2 ? '/' : action.path.slice(1).reduce((result, item) => result + '/' + item)

                    client.mpd.getList(path).then((result) => {
                        let children = listToChildren(result)
                        store.dispatch(treeUpdated(action.path, children))
                    }).catch((e) => {
                        console.log(e)
                        store.dispatch(error(e, types.CHANGE_CURRENT_DIR))
                    })
                }
                break

            case types.ADD_TO_QUEUE:
                const { items, position } = action

                const handleFile = (uri, position) => {
                    return new Promise((resolve, reject) => {
                        client.mpd.addToQueue(uri, position).then((result) => {
                            resolve(1+position)
                        }).catch((e) => {
                            reject(e)
                        })
                    })
                }

                const handleFileList = (uris, position) => {
                    return uris.reduce((promise, uri) => {
                        return new Promise((resolve, reject) => {
                            promise.then((pos) => {
                                handleFile(uri, pos).then((newPos) => {
                                    resolve(newPos)
                                }).catch((e) => {
                                    reject(e)
                                })
                            })
                        })
                    }, Promise.resolve(position))
                }

                const handlePlaylist = (uri, position) => {
                    return client.mpd.getPlaylist(uri).then((content) => {
                        let files = content.map(node => { return node.file })
                        return handleFileList(files, position)
                    })
                }

                const handleDirectory = (uri, position) => {
                    return getContentRecursively(uri).then((content) => {
                        let files = content.map(node => { return node.fullPath })
                        return handleFileList(files, position)
                    })
                }

                const handleAlbum = (artist, album, position) => {
                    const expression = [
                        { tag: 'artist', value: artist },
                        { tag: 'album', value: album },
                    ]

                    const searchExpressions = expression.map(({ tag, value }) => {
                        return '(' + tag + ' == \'' + sanitize(value)  + '\')'
                    })

                    const combined = '(' + searchExpressions.join(' AND ')  + ')'

                    // Get search results.
                    return client.mpd.search(combined).then(results => {
                        let list = listToChildren(results, false)
                        let files = list.map((song) => { return song.fullPath })
                        return handleFileList(files, position)
                    })
                }

                const handleArtist = (artist, position) => {
                    console.log('artist:' + artist)
                    console.log('sanitized:' + sanitize(artist))
                    const searchExpression = '(artist == \'' + sanitize(artist)  + '\')'

                    // Get search results.
                    return client.mpd.search(searchExpression).then(results => {
                        let files = results.map((song) => { return song.file })
                        return handleFileList(files, position)
                    })
                }

                const handleEverything = (items, position) => {
                    return items.reduce((promise, { path, type, data }) => {
                        return promise.then((newPos) => {
                            if (type == TreeNodeType.DIRECTORY) {
                                return handleDirectory(path, newPos)
                            } else if (type == TreeNodeType.PLAYLIST) {
                                return handlePlaylist(path, newPos)
                            } else if (type == TreeNodeType.ARTIST) {
                                return handleArtist(path, newPos)
                            } else if (type == TreeNodeType.ALBUM) {
                                return handleAlbum(data.artist, data.album, newPos)
                            } else {
                                return handleFile(path, newPos)
                            }
                        })
                    }, Promise.resolve(position))
                }

                handleEverything(items, position).catch((e) => {
                    console.log(e)
                    store.dispatch(error(e, types.ADD_TO_QUEUE))
                })
                break

            case types.ADD_TO_QUEUE_PLAY:
                const { uri: song, position: pos } = action

                client.mpd.addToQueue(song, pos).then(({ Id }) => {
                    client.mpd.setCurrentSong(Id)
                }).catch((e) => {
                    console.log(e)
                    store.dispatch(error(e, types.ADD_TO_QUEUE_PLAY))
                })
                break

            case types.SEARCH: {
                const { expression } = action

                const searchExpressions = expression.map(({ tag, value }) => {
                    return '(' + tag + ' contains \'' + sanitize(value)  + '\')'
                })

                const combined = '(' + searchExpressions.join(' AND ')  + ')'

                // Reset previous search results.
                store.dispatch(searchUpdated(null))

                // Get new search results.
                client.mpd.search(combined).then(results => {
                    var list = listToChildren(results, false)
                    store.dispatch(searchUpdated(list))
                }).catch((e) => {
                    console.log(e)
                    store.dispatch(error(e, types.SEARCH))
                })
                break
            }
            case types.LOAD_ARTISTS: {
                client.mpd.getArtists().then(result => {
                    store.dispatch(artistsLoaded(result))
                }).catch((e) => {
                    console.log(e)
                    store.dispatch(error(e, types.LOAD_ARTISTS))
                })
                break
            }
            case types.LOAD_ALBUMS: {
                client.mpd.getAlbums(action.artist).then(result => {
                    store.dispatch(albumsLoaded(action.artist, result))
                }).catch((e) => {
                    console.log(e)
                    store.dispatch(error(e, types.LOAD_ALBUMS))
                })
                break
            }
            case types.LOAD_SONGS: {
                const { artist, album } = action

                const expression = [
                    { tag: 'artist', value: artist },
                    { tag: 'album', value: album },
                ]

                const searchExpressions = expression.map(({ tag, value }) => {
                    return '(' + tag + ' == \'' + sanitize(value)  + '\')'
                })

                const combined = '(' + searchExpressions.join(' AND ')  + ')'

                // Get search results.
                client.mpd.search(combined).then(results => {
                    var list = listToChildren(results, false)
                    store.dispatch(songsLoaded(artist, album, list))
                }).catch((e) => {
                    console.log(e)
                    store.dispatch(error(e, types.LOAD_SONGS))
                })
                break
            }
            default:
                break
        }

        return next(action)
    }
}

export default mpdMiddleware

