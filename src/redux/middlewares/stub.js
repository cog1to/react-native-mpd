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

import { 
    getOutputs,
    outputsUpdated,
} from '../reducers/outputs/actions'

import { TreeNodeType } from '../reducers/browser/reducer'

import { sanitize } from '../../utils/StringUtils'

/* Client */

const client = {
  connected: false,
  state: {
    player: "pause",
    elapsed: 100,
    duration: 200,
    songid: "2",
    random: 0,
    repeat: 0,
    consume: 0,
    single: '0',
    crossfade: 0,
    volume: 80,
    replayGain: 'off'
  },
  outputs: [
    {
        enabled: true,
        id: "0",
        name: "pulse audio",
        plugin: "pulse",
    },
    {
        enabled: true,
        id: "1",
        name: "FIFO",
        plugin: "fifo",
    }
  ],
  song: {
    album: "Midnights",
    albumArtis: "Taylor Swift",
    artist: "Taylor Swift",
    file: "Taylor Swift/2022 - Midnights/02 - Maroon.mp3",
    position: 1,
    songId: "2",
    title: "Maroon"
  },
  queue: [
    {
      album: "Midnights",
      albumArtis: "Taylor Swift",
      artist: "Taylor Swift",
      file: "Taylor Swift/2022 - Midnights/01 - Lavender Haze.mp3",
      position: 0,
      songId: "1",
      title: "Lavender Haze"
    },
    {
      album: "Midnights",
      albumArtis: "Taylor Swift",
      artist: "Taylor Swift",
      file: "Taylor Swift/2022 - Midnights/02 - Maroon.mp3",
      position: 1,
      songId: "2",
      title: "Maroon"
    },
    {
      album: "Midnights",
      albumArtis: "Taylor Swift",
      artist: "Taylor Swift",
      file: "Taylor Swift/2022 - Midnights/03 - Anti-Hero.mp3",
      position: 2,
      songId: "3",
      title: "Anti-Hero"
    },
    {
      album: "Midnights",
      albumArtis: "Taylor Swift",
      artist: "Taylor Swift",
      file: "Taylor Swift/2022 - Midnights/04 - You're On Your Own, Kid.mp3",
      position: 3,
      songId: "4",
      title: "You're On Your Own, Kid"
    },
    {
      album: "Midnights",
      albumArtis: "Taylor Swift",
      artist: "Taylor Swift",
      file: "Taylor Swift/2022 - Midnights/05 - Snow On The Beach.mp3",
      position: 4,
      songId: "5",
      title: "Snow On The Beach"
    },
    {
      album: "Midnights",
      albumArtis: "Taylor Swift",
      artist: "Taylor Swift",
      file: "Taylor Swift/2022 - Midnights/06 - Midnight Rain.mp3",
      position: 5,
      songId: "6",
      title: "Midnight Rain"
    },
    {
      album: "Midnights",
      albumArtis: "Taylor Swift",
      artist: "Taylor Swift",
      file: "Taylor Swift/2022 - Midnights/07 - Question____.mp3",
      position: 6,
      songId: "7",
      title: "Question...?"
    },
    {
      album: "Midnights",
      albumArtis: "Taylor Swift",
      artist: "Taylor Swift",
      file: "Taylor Swift/2022 - Midnights/08 - Vigilante Shit.mp3",
      position: 7,
      songId: "8",
      title: "Vigilante Shit"
    },
    {
      album: "Midnights",
      albumArtis: "Taylor Swift",
      artist: "Taylor Swift",
      file: "Taylor Swift/2022 - Midnights/09 - Bejeweled.mp3",
      position: 8,
      songId: "9",
      title: "Bejeweled"
    },
    {
      album: "Midnights",
      albumArtis: "Taylor Swift",
      artist: "Taylor Swift",
      file: "Taylor Swift/2022 - Midnights/10 - Labyrinth.mp3",
      position: 9,
      songId: "10",
      title: "Labyrinth"
    },
    {
      album: "Midnights",
      albumArtis: "Taylor Swift",
      artist: "Taylor Swift",
      file: "Taylor Swift/2022 - Midnights/11 - Karma.mp3",
      position: 10,
      songId: "11",
      title: "Karma"
    },
    {
      album: "Midnights",
      albumArtis: "Taylor Swift",
      artist: "Taylor Swift",
      file: "Taylor Swift/2022 - Midnights/12 - Sweet Nothing.mp3",
      position: 11,
      songId: "12",
      title: "Sweet Nothing"
    },
    {
      album: "Midnights",
      albumArtis: "Taylor Swift",
      artist: "Taylor Swift",
      file: "Taylor Swift/2022 - Midnights/13 - Mastermind.mp3",
      position: 12,
      songId: "13",
      title: "Mastermind"
    }
  ],
  tree: {
    name: "",
    type: "DIRECTORY",
    fullPath: "",
    children: [
      {
        name: "Taylor Swift",
        fullPath: "Taylor Swift",
        type: "DIRECTORY",
        children: [
          {
            name: "2022 - Midnights",
            fullPath: "Taylor Swift/2022 - Midnights",
            type: "DIRECTORY",
            children: [
              {
                type: "FILE",
                fullPath: "Taylor Swift/2022 - Midnights/01 - Lavender Haze.mp3",
                name: "01 - Lavender Haze.mp3",
                title: "Lavender Haze",
                artist: "Taylor Swift",
                albumArtist: "Taylor Swift",
                children: [],
              },
              {
                type: "FILE",
                fullPath: "Taylor Swift/2022 - Midnights/02 - Maroon.mp3",
                name: "02 - Maroon.mp3",
                title: "Maroon",
                artist: "Taylor Swift",
                albumArtist: "Taylor Swift",
                children: [],
              },
              {
                type: "FILE",
                fullPath: "Taylor Swift/2022 - Midnights/03 - Anti-Hero.mp3",
                name: "03 - Anti-Hero.mp3",
                title: "Anti-Hero",
                artist: "Taylor Swift",
                albumArtist: "Taylor Swift",
                children: [],
              },
              {
                type: "FILE",
                fullPath: "Taylor Swift/2022 - Midnights/04 - You're On Your Own, Kid.mp3",
                name: "04 - You're On Your Own, Kid.mp3",
                title: "You're On Your Own, Kid",
                artist: "Taylor Swift",
                albumArtist: "Taylor Swift",
                children: [],
              },
              {
                type: "FILE",
                fullPath: "Taylor Swift/2022 - Midnights/05 - Snow On The Beach.mp3",
                name: "05 - Snow On The Beach.mp3",
                title: "Snow On The Beach",
                artist: "Taylor Swift",
                albumArtist: "Taylor Swift",
                children: [],
              },
              {
                type: "FILE",
                fullPath: "Taylor Swift/2022 - Midnights/06 - Midnight Rain.mp3",
                name: "06 - Midnight Rain.mp3",
                title: "Midnight Rain",
                artist: "Taylor Swift",
                albumArtist: "Taylor Swift",
                children: [],
              },
              {
                type: "FILE",
                fullPath: "Taylor Swift/2022 - Midnights/07 - Question____.mp3",
                name: "07 - Question____.mp3",
                title: "Question...?",
                artist: "Taylor Swift",
                albumArtist: "Taylor Swift",
                children: [],
              },
              {
                type: "FILE",
                fullPath: "Taylor Swift/2022 - Midnights/08 - Vigilante Shit.mp3",
                name: "08 - Vigilante Shit.mp3",
                title: "Vigilante Shit",
                artist: "Taylor Swift",
                albumArtist: "Taylor Swift",
                children: [],
              },
              {
                type: "FILE",
                fullPath: "Taylor Swift/2022 - Midnights/09 - Bejeweled.mp3",
                name: "09 - Bejeweled.mp3",
                title: "Bejeweled",
                artist: "Taylor Swift",
                albumArtist: "Taylor Swift",
                children: [],
              },
              {
                type: "FILE",
                fullPath: "Taylor Swift/2022 - Midnights/10 - Labyrinth.mp3",
                name: "10 - Labyrinth.mp3",
                title: "Labyrinth",
                artist: "Taylor Swift",
                albumArtist: "Taylor Swift",
                children: [],
              },
              {
                type: "FILE",
                fullPath: "Taylor Swift/2022 - Midnights/11 - Karma.mp3",
                name: "11 - Karma.mp3",
                title: "Karma",
                artist: "Taylor Swift",
                albumArtist: "Taylor Swift",
                children: [],
              },
              {
                type: "FILE",
                fullPath: "Taylor Swift/2022 - Midnights/12 - Sweet Nothing.mp3",
                name: "12 - Sweet Nothing.mp3",
                title: "Sweet Nothing",
                artist: "Taylor Swift",
                albumArtist: "Taylor Swift",
                children: [],
              },
              {
                type: "FILE",
                fullPath: "Taylor Swift/2022 - Midnights/13 - Mastermind.mp3",
                name: "13 - Mastermind.mp3",
                title: "Mastermind",
                artist: "Taylor Swift",
                albumArtist: "Taylor Swift",
                children: [],
              },
            ]
          }
        ]
      },
    ]
  },
  library: [
    {
      artist: "Taylor Swift",
      albums: [
        {
          album: "Midnights",
          songs: [
            {
              type: "FILE",
              fullPath: "Taylor Swift/2022 - Midnights/01 - Lavender Haze.mp3",
              name: "01 - Lavender Haze.mp3",
              title: "Lavender Haze",
              artist: "Taylor Swift",
              albumArtist: "Taylor Swift",
              children: [],
            },
            {
              type: "FILE",
              fullPath: "Taylor Swift/2022 - Midnights/02 - Maroon.mp3",
              name: "02 - Maroon.mp3",
              title: "Maroon",
              artist: "Taylor Swift",
              albumArtist: "Taylor Swift",
              children: [],
            },
            {
              type: "FILE",
              fullPath: "Taylor Swift/2022 - Midnights/03 - Anti-Hero.mp3",
              name: "03 - Anti-Hero.mp3",
              title: "Anti-Hero",
              artist: "Taylor Swift",
              albumArtist: "Taylor Swift",
              children: [],
            },
            {
              type: "FILE",
              fullPath: "Taylor Swift/2022 - Midnights/04 - You're On Your Own, Kid.mp3",
              name: "04 - You're On Your Own, Kid.mp3",
              title: "You're On Your Own, Kid",
              artist: "Taylor Swift",
              albumArtist: "Taylor Swift",
              children: [],
            },
            {
              type: "FILE",
              fullPath: "Taylor Swift/2022 - Midnights/05 - Snow On The Beach.mp3",
              name: "05 - Snow On The Beach.mp3",
              title: "Snow On The Beach",
              artist: "Taylor Swift",
              albumArtist: "Taylor Swift",
              children: [],
            },
            {
              type: "FILE",
              fullPath: "Taylor Swift/2022 - Midnights/06 - Midnight Rain.mp3",
              name: "06 - Midnight Rain.mp3",
              title: "Midnight Rain",
              artist: "Taylor Swift",
              albumArtist: "Taylor Swift",
              children: [],
            },
            {
              type: "FILE",
              fullPath: "Taylor Swift/2022 - Midnights/07 - Question____.mp3",
              name: "07 - Question____.mp3",
              title: "Question...?",
              artist: "Taylor Swift",
              albumArtist: "Taylor Swift",
              children: [],
            },
            {
              type: "FILE",
              fullPath: "Taylor Swift/2022 - Midnights/08 - Vigilante Shit.mp3",
              name: "08 - Vigilante Shit.mp3",
              title: "Vigilante Shit",
              artist: "Taylor Swift",
              albumArtist: "Taylor Swift",
              children: [],
            },
            {
              type: "FILE",
              fullPath: "Taylor Swift/2022 - Midnights/09 - Bejeweled.mp3",
              name: "09 - Bejeweled.mp3",
              title: "Bejeweled",
              artist: "Taylor Swift",
              albumArtist: "Taylor Swift",
              children: [],
            },
            {
              type: "FILE",
              fullPath: "Taylor Swift/2022 - Midnights/10 - Labyrinth.mp3",
              name: "10 - Labyrinth.mp3",
              title: "Labyrinth",
              artist: "Taylor Swift",
              albumArtist: "Taylor Swift",
              children: [],
            },
            {
              type: "FILE",
              fullPath: "Taylor Swift/2022 - Midnights/11 - Karma.mp3",
              name: "11 - Karma.mp3",
              title: "Karma",
              artist: "Taylor Swift",
              albumArtist: "Taylor Swift",
              children: [],
            },
            {
              type: "FILE",
              fullPath: "Taylor Swift/2022 - Midnights/12 - Sweet Nothing.mp3",
              name: "12 - Sweet Nothing.mp3",
              title: "Sweet Nothing",
              artist: "Taylor Swift",
              albumArtist: "Taylor Swift",
              children: [],
            },
            {
              type: "FILE",
              fullPath: "Taylor Swift/2022 - Midnights/13 - Mastermind.mp3",
              name: "13 - Mastermind.mp3",
              title: "Mastermind",
              artist: "Taylor Swift",
              albumArtist: "Taylor Swift",
              children: [],
            },
          ]
        }
      ]
    }
  ],
  playlists: [
    {
      fullPath: "My Favorite Songs",
      name: "My Favorite Songs",
      type: "PLAYLIST",
      lastModified: Date.now(),
      songs: [
        {
          type: "FILE",
          fullPath: "Taylor Swift/2022 - Midnights/02 - Maroon.mp3",
          name: "02 - Maroon.mp3",
          title: "Maroon",
          artist: "Taylor Swift",
          albumArtist: "Taylor Swift",
          children: [],
        },
        {
          type: "FILE",
          fullPath: "Taylor Swift/2022 - Midnights/13 - Mastermind.mp3",
          name: "13 - Mastermind.mp3",
          title: "Mastermind",
          artist: "Taylor Swift",
          albumArtist: "Taylor Swift",
          children: [],
        }
      ],
    }
  ],
}

export const stubMiddleware = store => {
    return next => action => {
        if (action.type == types.CONNECT) {
            if (action.host == "!demo" /*&& action.port == "9999"*/) {
                console.log("STUB DETECTED")
                client.connected = true
                store.dispatch(connected(true))
                store.dispatch(getStatus('status'))
                store.dispatch(commandsReceived(['previous', 'next', 'play']))
                return
            }
        }

        if (!client.connected) {
            return next(action)
        }

        switch (action.type) {
            case types.DISCONNECT: {
                if (client.connected == true) {
                    store.dispatch(setIntentional(true))
                    client.connected = false
                    store.dispatch(connected(false))
                } else {
                    return next(action)
                }
                break
            }
            case types.GET_STATUS: {
                store.dispatch(statusUpdated(client.state, action.source))
                break
            }
            case types.STATUS_UPDATED: {
                if (action.source === 'progress') {
                   // Emulate updates.
                }

                if ('status' in action && 'songid' in action.status && action.status.songid != store.getState().status.songid) {
                    store.dispatch(getCurrentSong())
                }

                if (store.getState().queue.length == 0) {
                    store.dispatch(getQueue())
                }

                action.handled = true
                return next(action)
                break
            }
            case types.GET_CURRENT_SONG: {
                let song = client.song
                console.log("GET_CURRENT_SONG", song)
                store.dispatch(currentSongUpdated(song))
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
                    let knownTree = client.tree
                    let knownNode = nodeFromPath(action.path, knownTree)
                    store.dispatch(treeUpdated(action.path, knownNode.children))
                }
                break
            }
            case types.LOAD_ARTISTS: {
                let artists = client.library.map(item => {
                  let node = {}
                  node["Artist"] = item.artist
                  return node
                })

                store.dispatch(artistsLoaded(artists))
                break
            }
            case types.LOAD_ALBUMS: {
                let artist = client.library.filter(el => el.artist === action.artist)[0]
                let albums = artist.albums.map(el => {
                  let node = {}
                  node["Album"] = el.album
                  return node
                })
                
                store.dispatch(albumsLoaded(action.artist, albums))
                break
            }
            case types.LOAD_SONGS: {
                let artist = client.library.filter(el => el.artist === action.artist)[0]
                let album = artist.albums.filter(el => el.album === action.album)[0]
                store.dispatch(songsLoaded(action.artist, action.album, album.songs))
                break
            }
            case types.PLAY_PAUSE: {
                // TODO
                break
            }
            case types.PLAY_NEXT: {
                let song = client.song
                
                if ((song.position + 1) < client.queue.length) {
                    client.song = client.queue[song.position + 1]
                    client.state = {
                      ...client.state,
                      songid: client.song.songId,
                    }
                  
                    store.dispatch(currentSongUpdated(song))
                    store.dispatch(statusUpdated(client.state, 'update'))
                }
                break
            }
            case types.PLAY_PREVIOUS: {
                let song = client.song
                
                if ((song.position - 1) >= 0) {
                    client.song = client.queue[song.position - 1]
                    client.state = {
                      ...client.state,
                      songid: client.song.songId,
                    }

                    store.dispatch(currentSongUpdated(song))
                    store.dispatch(statusUpdated(client.state, 'update'))
                }
                break
            }
            case types.SEEK: {
                client.state = {
                    ...client.state,
                    elapsed: action.position,
                }
                store.dispatch(statusUpdated(client.state, 'update'))
                break
            }
            case types.GET_QUEUE: {
                store.dispatch(queueUpdated(client.queue))
                break
            }
            case types.SET_CURRENT_SONG: {
                let song = client.queue.filter(el => el.songId === action.songId)[0]
                
                if (song !== null) {
                    client.song = song
                    client.state = {
                        ...client.state,
                        songid: client.song.songId,
                        player: 'pause',
                        duration: 200,
                        elapsed: 100,
                    }

                    store.dispatch(currentSongUpdated(song))
                    store.dispatch(statusUpdated(client.state, 'update'))
                }
                break
            }
            case types.MOVE_SONG: {
                const { id, to } = action
                var song = client.queue.filter(el => el.songId === id)[0]
                const currentPosition = song.position

                var newQueue = client.queue.filter(el => el.songId !== id)
                newQueue.splice(to, 0, song)

                // Update indexes.
                newQueue = newQueue.map((el, idx) => {
                  return {
                    ...el,
                    position: idx,
                  }
                })

                client.queue = newQueue
                store.dispatch(queueUpdated(newQueue))

                break
            }
            case types.DELETE_SONGS: {
                console.log("DELETE", action)
                newQueue = client.queue.filter(el => {
                    return (action.songIds.filter(id => id === el.songId).length === 0)
                })

                // Update indexes.
                newQueue = newQueue.map((el, idx) => {
                  return {
                    ...el,
                    position: idx,
                  }
                })
                client.queue = newQueue
                store.dispatch(queueUpdated(newQueue))

                if (action.songIds.filter(id => id === client.state.songid).length > 0) {
                    client.state = {
                        ...client.state,
                        player: "stop",
                        songid: null,
                        elapsed: 0,
                        duration: 0,
                    }
                    store.dispatch(statusUpdated(client.state, 'status'))
                }

                break
            }
            case types.CLEAR_QUEUE: {
                client.queue = []
                client.state = {
                    ...client.state,
                    player: "stop",
                    songid: null,
                    elapsed: 0,
                    duration: 0,
                }

                store.dispatch(queueUpdated(client.queue))
                store.dispatch(statusUpdated(client.state, 'status'))
                break
            }
            case types.ADD_TO_QUEUE: {
                const { items, position } = action

                var queue = client.queue
                var maxId = queue.reduce((prev, song) => {
                  if (parseInt(song.songId) > prev) {
                    return parseInt(song.songId)
                  } else {
                    return prev
                  }
                }, 0)

                // Retrieve all files.
                let files = allFiles(items, client.tree).map((item, idx) => {
                    return {
                        ...item,
                        songId: "" + (maxId + idx)
                    }
                })
                for (let i = 0; i < files.length; i = i + 1) {
                    queue.splice(position + i, 0, files[i])
                }

                // Update positions.
                queue = queue.map((item, idx) => {
                    return {
                        ...item,
                        position: idx,
                    }
                })

                // Send update signal.
                client.queue = queue
                store.dispatch(queueUpdated(client.queue))

                break
            }
            case types.ADD_TO_QUEUE_PLAY: {
                const { uri: song, position: pos } = action

                var queue = client.queue
                var maxId = queue.reduce((prev, song) => {
                  if (parseInt(song.songId) > prev) {
                    return parseInt(song.songId)
                  } else {
                    return prev
                  }
                }, 0)
                
                let sliced = [""].concat(song.split("/"))
                let orig = nodeFromPath(sliced, client.tree)
                let node = {
                    ...orig,
                    songId: "" + (maxId + 1),
                    position: pos,
                }

                // Add and update queue.
                queue.splice(pos, 0, node)  
                queue = queue.map((item, idx) => {
                    return {
                        ...item,
                        position: idx,
                    }
                })
                client.queue = queue

                // Update current song 
                client.song = node
                client.state = {
                    ...client.state,
                    songid: client.song.songId,
                }
              
                // Send updates
                store.dispatch(queueUpdated(client.queue))
                store.dispatch(currentSongUpdated(client.song))
              
                break
            }
            case types.SET_VOLUME: {
                const { volume } = action
                client.state = {
                    ...client.state,
                    volume: volume,
                }
                break
            }
            case types.SET_CONSUME: {
                client.state = {
                    ...client.state,
                    consume: (action.enabled ? 1 : 0),
                }
                store.dispatch(getStatus())
                break
            }
            case types.SET_REPEAT: {
                client.state = {
                    ...client.state,
                    repeat: (action.enabled ? 1 : 0),
                }
                store.dispatch(getStatus())
                break
            }
            case types.SET_RANDOM: {
                client.state = {
                    ...client.state,
                    random: (action.enabled ? 1 : 0),
                }
                store.dispatch(getStatus())
                break
            }
            case types.CROSSFADE: {
                client.state = {
                    ...client.state,
                    crossfade: action.value,
                }
                store.dispatch(getStatus())
                break
            }
            case types.SET_REPLAY_GAIN_MODE: {
                client.state = {
                    ...client.state, 
                    replayGain: action.value,
                }
                store.dispatch(getReplayGainStatus())
                break
            }
            case types.GET_REPLAY_GAIN_STATUS: {
                store.dispatch(replayGainStatusUpdated(
                    {
                        replay_gain_mode: client.state.replayGain
                    }
                ))
                break
            }
            case types.SET_SINGLE: {
                client.state.single = action.value
                store.dispatch(getStatus())
                break
            }
            case types.GET_OUTPUTS: {
                store.dispatch(outputsUpdated(client.outputs))
                break
            }
            case types.ENABLE_OUTPUT: {
                client.outputs = client.outputs.map(el => {
                    return {
                        ...el,
                        enabled: (action.id === el.id) ? true : el.enabled
                    }
                })
                store.dispatch(getOutputs())
                break
            }
            case types.DISABLE_OUTPUT: {
                client.outputs = client.outputs.map(el => {
                    return {
                        ...el,
                        enabled: (action.id === el.id) ? false : el.enabled
                    }
                })
                store.dispatch(getOutputs())
                break
            }
            case types.GET_PLAYLISTS: {
                store.dispatch(loadingPlaylists(true))
                store.dispatch(playlistsLoaded(client.playlists))
                break
            }
            case types.GET_PLAYLIST: {
                const { name } = action

                store.dispatch(loadingPlaylist(true))

                let playlists = client.playlists.filter(el => el.name === name)
                if (playlists.length > 0) {
                    store.dispatch(playlistLoaded(name, playlists[0].songs))
                }
                break
            }
            case types.ADD_TO_PLAYLIST: {
                console.log("ADD TO PLAYLIST", action)
                const { name, paths } = action
                
                let playlist = client.playlists.filter(el => el.name === name)[0]
                let files = allFiles(paths, client.tree)
 
                console.log("FILES", files)

                let items = files.map(el => {
                    return {
                        type: "FILE",
                        fullPath: el.fullPath,
                        name: el.name,
                        title: el.title,
                        artist: el.artist,
                        albumArtist: el.albumArtist,
                        children: [],
                    }
                })

                client.playlists = client.playlists.map(playlist => {
                    if (playlist.name === name) {
                        return {
                            ...playlist,
                            lastModified: Date.now(),
                            songs: playlist.songs.concat(items)
                        }
                    } else {
                        return playlist
                    }
                })
                
                break
            }
            case types.DELETE_PLAYLISTS: {
                const { names } = action

                client.playlists = client.playlists.filter(el => {
                    return names.filter(name => name === el.name).length === 0
                })

                store.dispatch(playlistsLoaded(client.playlists))

                break
            }
            case types.PLAYLIST_DELETE: {
                const { name, indices } = action
                
                client.playlists = client.playlists.map(playlist => {
                    if (playlist.name === name) {
                        return {
                            ...playlist,
                            lastModified: Date.now(),
                            songs: playlist.songs.filter((el, idx) => {
                                indices.find(ind => ind === idx) === null
                            })
                        }
                    } else {
                        return playlist
                    }
                })

                let playlist = client.playlists.find(el => el.name === name)
                store.dispatch(playlistLoaded(name, playlist.songs))

                break
            }
            case types.PLAYLIST_MOVE: {
                const { name, from, to } = action

                client.playlists = client.playlists.map(playlist => {
                    if (playlist.name === name) {
                        var songs = playlist.songs.filter((s, i) => i !== from)
                        let target = playlist.songs[from]

                        songs.splice(to, 0, target)

                        let newPlaylist = {
                            ...playlist,
                            lastModified: Date.now(),
                            songs
                        }

                        store.dispatch(playlistLoaded(name, newPlaylist.songs))

                        return newPlaylist
                    } else {
                        return playlist
                    }
                })

                break
            }
            default: {
                return next(action)
                break
            }
        }
    }
}

export default stubMiddleware

/* Helpers */

const getContentRecursively = (node) => {
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
            let sliced = [""].concat(path.split("/"))
            let parentNode = nodeFromPath(sliced, client.tree)
            
            if (parentNode !== null) {
                let children = parentNode.children
                for (let index = 0; index < children.length; index++) {
                    let subResults = getContentRecursively(children[index])
                    results = results.concat(subResults)
                }
            }

            break
        }
        case TreeNodeType.PLAYLIST: {
            let path = ('fullPath' in node) ? node.fullPath : node.path
            let playlist = client.playlists.filter(p => p.name === path)[0]
            let files = playlist.songs
            results = results.concat(files)
            break
        }
        case TreeNodeType.ARTIST: {
            const { path } = node
            let artist = client.library.filter(ar => ar.artist === path)[0]
            for (let i = 0; i < artist.albums.length; i = i + 1) {
                let album = artist.albums[i]
                let files = album.songs
                results = results.concat(files)
            }
            break
        }
        case TreeNodeType.ALBUM: {
            console.log("Adding album node:", node)
            const { data: { album, artist } } = node

            let artistNode = client.library.filter(ar => ar.artist === artist)[0]
            let albumNode = artistNode.albums.filter(al => al.album === album)[0]
            let files = albumNode.songs
            results = results.concat(files)

            break
        }
    }

    return results
}


const allFiles = (paths, tree) => {
  let results = []

  for (let i = 0; i < paths.length; i = i + 1) {
    results = results.concat(getContentRecursively(paths[i]))
  }

  return results
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
        console.log("node =", node.name)
    })

    return node
}

