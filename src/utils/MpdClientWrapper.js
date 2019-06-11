import { sanitize } from './StringUtils'

var mpd = require('mpd'), cmd = mpd.cmd
const EventEmitter = require('events')

const EventNames = {
    ERROR: 'error',
    READY: 'ready',
    DISCONNECTED: 'end',
    SYSTEM: 'system'
}

const Subsystems = {
    PLAYER: 'player',
    MIXER: 'mixer',
    OPTIONS: 'options',
    PLAYLIST: 'playlist',
    STORED_PLAYLIST: 'stored_playlist',
}

/** 
 * Wrapper around MPD client library.
 */
export default class MpdClientWrapper {

    // MARK: - Public state.

    constructor() {
        this.listeners = {}

        const events = [
            EventNames.ERROR, 
            EventNames.DISCONNECTED, 
            Subsystems.PLAYER, 
            Subsystems.MIXER, 
            Subsystems.OPTIONS, 
            Subsystems.PLAYLIST, 
            Subsystems.STORED_PLAYLIST
        ]

        var self = this
        events.forEach(function(name) {
            self.listeners[name] = []
        })
    }

    get connected() {
        return this._client != null
    }

    get port() {
        return this.port
    }

    get host() {
        return this.host
    }

    // MARK: - Connection

    connect(host, port) {
        this.host = host
        this.port = port
        var self = this

        return new Promise((resolve, reject) => {
            try {
                var client = mpd.connect({host: host, port: port})

                if (client != null) {
                    // Before connection we define error handler to just invoke the callback, so we won't emit the error globally.
                    client.on(EventNames.ERROR, (err) => {
                        reject(err)
                    })

                    // Socket connected event.
                    client.on(EventNames.READY, () => {
                        self._client = client

                        // Redefine error emitter to pass through all errors after we're connected.
                        client.on(EventNames.ERROR, (err) => {
                            self._emit(EventNames.ERROR, [err])
                        })
                    
                        // Socket closed event.
                        client.on(EventNames.DISCONNECTED, () => {
                            console.log('*** disconnected')
                            self._client = null
                            self._emit(EventNames.DISCONNECTED)
                        })

                        // Subsystem updated event.
                        client.on(EventNames.SYSTEM, (name) => {
                            self._handleSystemUpdate(name)
                        })

                        resolve()
                    })
                } else {
                    reject(Error('Failed to connect'))
                }                
            } catch (e) {
                reject(e)
            }
        })
    }

    disconnect() {
        if (this.client != null) {
            return this._sendCommand(cmd('close', []))
        } else {
            return new Promise((resolve) => {
                resolve()
            })
        }
    }

    // MARK: - Commands

    // Sends a command to the player.
    _sendCommand(command, parser, callback) {
        return new Promise((resolve, reject) => {
            this._client.sendCommand(command, (error, result) => {
                if (error) {
                    reject(error)
                } else {
                    //console.log(result)
                    resolve(parser(result))
                }
            })
        })
    }

    parseList(entries) {
        return function(msg) {
            return mpd.parseArrayMessage(msg, entries)
        }
    }

    getStatus() {
        return this._sendCommand(cmd('status', []), mpd.parseKeyValueMessage)
    }

    getQueue() {
        return this._sendCommand(cmd('playlistinfo', []), mpd.parseArrayMessage)        
    }

    getCurrentSong() {
        return this._sendCommand(cmd('currentsong', []), mpd.parseKeyValueMessage)
    }

    getList(path) {
        return this._sendCommand(cmd('lsinfo', [path]), this.parseList(['directory', 'file', 'playlist']))
    }

    getPlaylist(name) {
        return this._sendCommand(cmd('listplaylist', [name]), mpd.parseArrayMessage)
    }

    play() {
        return this._sendCommand(cmd('pause', [0]), mpd.parseKeyValueMessage)
    }

    pause() {
        return this._sendCommand(cmd('pause', [1]), mpd.parseKeyValueMessage)        
    }

    next() {
        return this._sendCommand(cmd('next', []), mpd.parseKeyValueMessage)
    }

    previous() {
        return this._sendCommand(cmd('previous', []), mpd.parseKeyValueMessage)
    }

    seek(position) {
        return this._sendCommand(cmd('seekcur', [position]), mpd.parseKeyValueMessage)
    }

    search(expression) {
        return this._sendCommand(cmd('search', [expression]), mpd.parseArrayMessage)
    }

    setCurrentSong(songId) {
        return this._sendCommand(cmd('playid', [songId]), mpd.parseKeyValueMessage)
    }

    deleteSongId(songId) {
        return this._sendCommand(cmd('deleteid', [songId]), mpd.parseKeyValueMessage)   
    }

    addToQueue(uri, position) {
        return this._sendCommand(cmd('addid', [uri, position]), mpd.parseKeyValueMessage)
    }

    clear() {
        return this._sendCommand(cmd('clear', []), mpd.parseKeyValueMessage)
    }

    getArtists() {
        return this._sendCommand(cmd('list', ['artist']), mpd.parseArrayMessage)
    }

    getAlbums(artist) {
        return this._sendCommand(cmd('list', ['album', '(artist == "' + sanitize(artist) + '")']), mpd.parseArrayMessage)
    }

    getSongs(artist, album) {
        return this._sendCommand(cmd('list', [
            'title', 
            '((artist == "' + sanitize(artist) + '") AND (album == "' + sanitize(album) + '"))'
        ]), mpd.parseArrayMessage)
    }

    // MARK: - Event listeners

    _handleSystemUpdate(systemName) {
        if (systemName === Subsystems.PLAYER) {
            this._emit(Subsystems.PLAYER, [])
        } else if (systemName === Subsystems.PLAYLIST) {
            this._emit(Subsystems.PLAYLIST, [])
        } else if (systemName === Subsystems.OPTIONS) {
            this._emit(Subsystems.OPTIONS, [])
        } else if (systemName === Subsystems.MIXER) {
            this._emit(Subsystems.MIXER, [])
        } else if (systemName === Subsystems.STORED_PLAYLIST) {
            this._emit(Subsystems.STORED_PLAYLIST, [])
        }
    }

    _emit(eventName, args) {
        this.listeners[eventName].forEach(function(callback) {
            callback.apply(args)
        })
    }

    _subscribe(eventName, callback) {
        this.listeners[eventName].push(callback)

        var self = this
        return () => {
            self.listeners[eventName] = self.listeners[eventName].filter(cb => cb !== callback)
        }
    }

    onError(callback) {
        return this._subscribe(EventNames.ERROR, callback)
    }

    onDisconnected(callback) {
        return this._subscribe(EventNames.DISCONNECTED, callback)
    }

    /// Subscribes to player updates: start, stop, change song.
    onPlayerUpdate(callback) {
        return this._subscribe(Subsystems.PLAYER, callback)
    }

    /// Subscribes to current queue updates.
    onQueueUpdate(callback) {
        return this._subscribe(Subsystems.PLAYLIST, callback)    
    }

    /// Subscribes to play options updates: repeat, random, crossfade, replay gain, etc.
    onOptionsUpdate(callback) {
        return this._subscribe(Subsystems.OPTIONS, callback)    
    }

    /// Subscribes to mixer updates: volume changes.
    onMixerUpdate(callback) {
        return this._subscribe(Subsystems.MIXER, callback)    
    }

    /// Subscribes to mixer updates: volume changes.
    onPlaylistUpdate(callback) {
        return this._subscribe(Subsystems.STORED_PLAYLIST, callback)    
    }
}
