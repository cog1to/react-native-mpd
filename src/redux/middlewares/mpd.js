import types from '../types'

import {
    connect,
    connected,
    setIntentional,
    connectionError,
    commandsReceived,
    commands,
    error,
    getStatus,
    statusUpdated,
    getReplayGainStatus,
    replayGainStatusUpdated,
} from '../reducers/status/actions'

import {
    getCurrentSong,
    currentSongUpdated
} from '../reducers/currentsong/actions'

import {
    getQueue,
    queueUpdated,
} from '../reducers/queue/actions'

import { getAlbumArt } from '../reducers/archive/actions'

import {
    changeCurrentDir,
    treeUpdated,
    addToQueue,
    setRefreshing,
} from '../reducers/browser/actions'

import { searchUpdated } from '../reducers/search/actions'

import {
    setLibraryLoading,
    artistsLoaded,
    albumsLoaded,
    songsLoaded,
} from '../reducers/library/actions'

import { saveAddress } from '../reducers/storage/actions'

import {
    getPlaylists,
    playlistsLoaded,
    loadingPlaylists,
    getPlaylist,
    playlistLoaded,
    loadingPlaylist,
} from '../reducers/playlists/actions'

import MpdClientWrapper from '../../utils/MpdClientWrapper'

import { TreeNodeType } from '../reducers/browser/reducer'

import { sanitize } from '../../utils/StringUtils'

// MPD client singleton.
const client = {
    mpd: new MpdClientWrapper(),
    disconnects: [],
    progressTimeout: null,
    updatingProgress: false,
    playlistListeners: {},
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

// Returns a handler function for playlist update events.
const handlePlaylistUpdate = (store) => {
    return () => {
        store.dispatch(getPlaylists())
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
    const {
        state,
        elapsed = 0,
        duration = 0,
        songid = null,
        volume = 0,
        random = 0,
        repeat = 0,
        single = '0',
        consume = 0,
        xfade = 0,
    } = status

    return {
        player: state,
        elapsed: parseFloat(elapsed),
        duration: parseFloat(duration),
        songid: songid,
        volume: parseFloat(volume),
        random: parseFloat(random),
        repeat: parseFloat(repeat),
        consume: parseFloat(consume),
        single: single,
        crossfade: parseFloat(xfade),
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
            node.lastModified = new Date(element['Last-Modified'])
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

async function getContentRecursively(node) {
    let results = []

    switch (node.type) {
        case TreeNodeType.FILE: {
            let normalized = Object.assign({}, node)
            if (!('fullPath' in node) && ('path' in node)) {
                normalized.fullPath = node.path
            }

            results.push(normalized)
            break
        }
        case TreeNodeType.DIRECTORY: {
            let path = ('fullPath' in node) ? node.fullPath : node.path
            let children = listToChildren(await client.mpd.getList(path))

            for (let index = 0; index < children.length; index++) {
                let subResults = await getContentRecursively(children[index])
                results = results.concat(subResults)
            }

            break
        }
        case TreeNodeType.PLAYLIST: {
            let files = listToChildren(await client.mpd.getPlaylist(node.path))
            results = results.concat(files)
            break
        }
        case TreeNodeType.ARTIST: {
            const { path } = node
            const searchExpression = '(artist == \'' + sanitize(path)  + '\')'

            // Get search results.
            let children = listToChildren(await client.mpd.search(searchExpression))
            results = results.concat(children)

            break
        }
        case TreeNodeType.ALBUM: {
            const { data: { artist, album } } = node
            const expression = [
                { tag: 'artist', value: artist },
                { tag: 'album', value: album },
            ]

            const searchExpressions = expression.map(({ tag, value }) => {
                return '(' + tag + ' == \'' + sanitize(value)  + '\')'
            })

            const combined = '(' + searchExpressions.join(' AND ')  + ')'

            // Get search results.
            let children = listToChildren(await client.mpd.search(combined))
            results = results.concat(children)

            break
        }
    }

    return results
}

function nodesToPaths(items) {
    let promises = items.map((node) => {
        return new Promise((resolve, reject) => {
            getContentRecursively(node).then(result => {
                resolve(result)
            }).catch(e => { reject(e) })
        })
    })

    return promises.reduce((chain, task) => {
        return chain.then(result => {
            return task.then(files => {
                let content = [...result, ...files]
                return content
            })
        })
    }, Promise.resolve([]))
}

export const mpdMiddleware = store => {
    return next => action => {
        switch (action.type) {
            case types.CONNECT: {
                client.mpd = new MpdClientWrapper()
                client.mpd.connect(action.host, action.port).then(() => {
                    if (action.password !== null) {
                        return client.mpd.password(action.password)
                    } else {
                        return new Promise((resolve, reject) => { resolve() })
                    }
                }).then(() => {
                    // Subscribe to player events.
                    client.disconnects.push(client.mpd.onPlayerUpdate(handlePlayerUpdate(store)))

                    // Subscribe to queue events.
                    client.disconnects.push(client.mpd.onQueueUpdate(handleQueueUpdate(store)))

                    // Subscribe to queue events.
                    client.disconnects.push(client.mpd.onPlaylistUpdate(handlePlaylistUpdate(store)))

                    // Subscribe to error events.
                    client.disconnects.push(client.mpd.onError(handleErrorUpdate(store)))

                    // Subscribe to close events.
                    client.disconnects.push(client.mpd.onDisconnected(handleClose(store)))

                    // Emit connected action.
                    store.dispatch(connected(true))
                    store.dispatch(saveAddress({ host: action.host, port: action.port, password: action.password }))
                    store.dispatch(getStatus('status'))
                    store.dispatch(commands())
                }).catch((error) => {
                    store.dispatch(connectionError(error, action.attempt))
                })
                break
            }
            case types.DISCONNECT: {
                store.dispatch(setIntentional(true))

                // Stop progress update.
                if (client.updatingProgress) {
                    client.updatingProgress = false
                }

                if (client.progressTimeout !== null) {
                    clearTimeout(client.progressTimeout)
                }

                // Unsubscribe from all events.
                client.disconnects.forEach((callback) => {
                    callback()
                })

                client.mpd.disconnect().then(() => {
                    // Emit disconnected action.
                    store.dispatch(connected(false))
                }).catch((error) => {
                    store.dispatch(connectionError(error))
                })
                break
            }
            case types.CONNECTED: {
                // Stop progress update.
                if (client.updatingProgress) {
                    client.updatingProgress = false
                }

                if (client.progressTimeout !== null) {
                    clearTimeout(client.progressTimeout)
                }

                if (!action.connected) {
                    client.updatingProgress = false
                }

                break
            }
            case types.GET_STATUS: {
                if (!client.mpd.connected) {
                    break
                }

                client.mpd.getStatus().then((status) => {
                    const newState = statusToState(status)
                    store.dispatch(statusUpdated(newState, action.source))
                }).catch((e) => {
                    store.dispatch(error(e, types.GET_STATUS))
                })
                break
            }
            case types.COMMANDS: {
                client.mpd.commands().then((commands) => {
                    let mapped = commands.map((command) => { return command.command })
                    store.dispatch(commandsReceived(commands))
                }).catch((e) => {
                    store.dispatch(connectionError(error))
                })
            }
            case types.STATUS_UPDATED: {
               if (action.source === 'progress' && client.updatingProgress && client.mpd.connected) {
                   client.progressTimeout = setTimeout(() => store.dispatch(getStatus('progress')), 1000)
               }

               if ('status' in action && 'songid' in action.status && action.status.songid != store.getState().status.songid) {
                   store.dispatch(getCurrentSong())
               }

               if (store.getState().queue.length == 0) {
                   store.dispatch(getQueue())
               }

               break
            }
            case types.GET_CURRENT_SONG: {
               client.mpd.getCurrentSong().then((result) => {
                   let song = songToState(result)
                   store.dispatch(currentSongUpdated(song))
               }).catch((e) => {
                   store.dispatch(error(e, types.GET_CURRENT_SONG))
               })
               break
            }
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
            case types.PLAY_PAUSE: {
                const { state } = action

                if (state === 'play') {
                   client.mpd.play()
                } else {
                    client.mpd.pause()
                }
                break
            }
            case types.PLAY_NEXT: {
                client.mpd.next()
                break
            }
            case types.PLAY_PREVIOUS: {
                client.mpd.previous()
                break
            }
            case types.SEEK: {
                client.mpd.seek(action.position)
                break
            }
            case types.GET_QUEUE: {
                client.mpd.getQueue().then((result) => {
                    let queue = queueToState(result, true)
                    store.dispatch(queueUpdated(queue))
                }).catch((e) => {
                    store.dispatch(error(e, types.GET_QUEUE))
                })
                break
            }
            case types.SET_CURRENT_SONG: {
                client.mpd.setCurrentSong(action.songId)
                break
            }
            case types.DELETE_SONGS: {
                client.mpd.deleteSongIds(action.songIds).catch(e => {
                    store.dispatch(error(e, types.DELETE_SONGS)) 
                })
                break
            }
            case types.CLEAR_QUEUE: {
                client.mpd.clear().catch((e) => {
                    store.dispatch(error(e, types.CLEAR_QUEUE))
                })
                break
            }
            case types.MOVE_SONG: {
                const { id, to } = action
                client.mpd.moveSong(id, to).catch(e => {
                    store.dispatch(error(e, action.type))
                })
                break
            } case types.START_PROGRESS_UPDATE: {
                if (!client.updatingProgress) {
                    client.updatingProgress = true
                    store.dispatch(getStatus('progress'))
                }
                break
            }
            case types.STOP_PROGRESS_UPDATE: {
                client.updatingProgress = false
                if (client.progressTimeout !== null) {
                    clearTimeout(client.progressTimeout)
                }

                break
            }
            case types.CHANGE_CURRENT_DIR: {
                const { tree } = store.getState().browser

                let node = nodeFromPath(action.path, tree)

                // First we need to set 'refreshing' flag.
                // This ensures that refresh state won't get canceled before update is finished.
                store.dispatch(setRefreshing(true))

                if (!action.force && node !== null && node.children.length > 0) {
                    store.dispatch(treeUpdated(action.path, node.children))
                } else {
                    const path = action.path.length < 2 ? '/' : action.path.slice(1).reduce((result, item) => result + '/' + item)

                    client.mpd.getList(path).then((result) => {
                        let children = listToChildren(result)
                        store.dispatch(treeUpdated(action.path, children))
                    }).catch((e) => {
                        store.dispatch(error(e, types.CHANGE_CURRENT_DIR))
                        store.dispatch(setRefreshing(false))
                    })
                }
                break
            }
            case types.ADD_TO_QUEUE: {
                const { items, position } = action

                nodesToPaths(items).then((allFiles) => {
                    let filePaths = allFiles.map((node) => { return node.fullPath })

                    let filesWithPositions = []
                    for (let index = 0; index < filePaths.length; index++) {
                        filesWithPositions.push({ file: filePaths[index], position: position + index})
                    }

                    return client.mpd.addToQueue(filesWithPositions)
                }).catch(e => {
                    store.dispatch(error(e, types.ADD_TO_PLAYLIST))
                })

                break
            }
            case types.ADD_TO_QUEUE_PLAY: {
                const { uri: song, position: pos } = action

                client.mpd.addToQueue([{file: song, position: pos}]).then(({ Id }) => {
                    client.mpd.setCurrentSong(Id)
                }).catch((e) => {
                    store.dispatch(error(e, types.ADD_TO_QUEUE_PLAY))
                })
                break
            }
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
                    store.dispatch(error(e, types.SEARCH))
                })
                break
            }
            case types.LOAD_ARTISTS: {
                store.dispatch(setLibraryLoading(true))
                client.mpd.getArtists().then(result => {
                    store.dispatch(artistsLoaded(result))
                }).catch((e) => {
                    store.dispatch(setLibraryLoading(false))
                    store.dispatch(error(e, types.LOAD_ARTISTS))
                })
                break
            }
            case types.LOAD_ALBUMS: {
                store.dispatch(setLibraryLoading(true))
                client.mpd.getAlbums(action.artist).then(result => {
                    store.dispatch(albumsLoaded(action.artist, result))
                }).catch((e) => {
                    store.dispatch(setLibraryLoading(false))
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
                store.dispatch(setLibraryLoading(true))
                client.mpd.search(combined).then(results => {
                    var list = listToChildren(results, false)
                    store.dispatch(songsLoaded(artist, album, list))
                }).catch((e) => {
                    store.dispatch(setLibraryLoading(false))
                    store.dispatch(error(e, types.LOAD_SONGS))
                })
                break
            }
            case types.SET_VOLUME: {
                const { volume } = action
                client.mpd.setVolume(volume)
            }
            case types.SET_CONSUME: {
                client.mpd.setConsume(action.enabled).then((result) => {
                    store.dispatch(getStatus())
                })
                break
            }
            case types.SET_REPEAT: {
                client.mpd.setRepeat(action.enabled).then(() => {
                    store.dispatch(getStatus())
                })
                break
            }
            case types.SET_RANDOM: {
                client.mpd.setRandom(action.enabled).then(() => {
                    store.dispatch(getStatus())
                })
                break
            }
            case types.CROSSFADE: {
                client.mpd.crossfade(action.value).then(() => {
                    store.dispatch(getStatus())
                })
                break
            }
            case types.SET_SINGLE: {
                client.mpd.setSingle(action.value).then(() => {
                    store.dispatch(getStatus())
                })
                break
            }
            case types.SET_REPLAY_GAIN_MODE: {
                client.mpd.setReplayGain(action.value).then(() => {
                    store.dispatch(getReplayGainStatus())
                })
                break
            }
            case types.GET_REPLAY_GAIN_STATUS: {
                client.mpd.getReplayGain().then((status) => {
                    store.dispatch(replayGainStatusUpdated(status))
                })
                break
            }
            case types.GET_PLAYLISTS: {
                store.dispatch(loadingPlaylists(true))

                client.mpd.getPlaylists().then((list) => {
                    store.dispatch(playlistsLoaded(listToChildren(list)))
                })
                break
            }
            case types.GET_PLAYLIST: {
                const { name } = action

                store.dispatch(loadingPlaylist(true))

                client.mpd.getPlaylist(name).then(data => {
                    store.dispatch(playlistLoaded(name, listToChildren(data)))
                })
                break
            }
            case types.ADD_TO_PLAYLIST: {
                const { name, paths } = action

                nodesToPaths(paths).then((allFiles) => {
                    let filePaths = allFiles.map((node) => { return node.fullPath })
                    return client.mpd.addToPlaylist(name, filePaths)
                }).catch(e => {
                    store.dispatch(error(e, types.ADD_TO_PLAYLIST))
                })

                break
            }
            case types.DELETE_PLAYLISTS: {
                const { names } = action

                const handleFile = (name) => {
                    return client.mpd.deletePlaylist(name)
                }

                const handleList = (names) => {
                    return names.reduce((promise, name) => {
                        return new Promise((resolve, reject) => {
                            promise.then(() => {
                                return handleFile(name).then(() => {
                                    resolve()
                                }).catch((e) => {
                                    reject(e)
                                })
                            })
                        })
                    }, Promise.resolve())
                }

                handleList(names).catch((e) => {
                    store.dispatch(error(e, types.DELETE_PLAYLISTS))
                })

                break
            }
            case types.PLAYLIST_MOVE: {
                const { name, from, to } = action
                
                client.mpd.playlistMove(name, from, to).then((result) => {
                    store.dispatch(getPlaylist(name))
                })
                .catch(e => {
                    store.dispatch(error(e, action.type))
                })
                break
            }
            case types.PLAYLIST_DELETE: {
                const { name, indices } = action
                
                client.mpd.playlistDelete(name, indices).then((result) => {
                    store.dispatch(getPlaylist(name))
                })
                .catch(e => {
                    store.dispatch(error(e, action.type))
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
