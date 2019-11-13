import { sanitize } from './StringUtils'

var mpd = require('../node/mpd'), cmd = mpd.cmd
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
    this.cmd = cmd

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
    if (this._client != null) {
      this._client.close()
      return Promise.resolve()
    } else {
      return new Promise((resolve) => {
        resolve()
      })
    }
  }

  password(pwd) {
    if (this._client != null) {
      return this._sendCommand(cmd('password', [pwd]), mpd.parseKeyValueMessage)
    } else {
      return new Promise((resolve, reject) => {
        reject()
      })
    }
  }

  commands() {
    return this._sendCommand(cmd('commands', []), mpd.parseArrayMessage)
  }

  // MARK: - Commands

  // Sends a command to the player.
  _sendCommand(command, parser, callback) {
    // Don't send commands if we're disconnected.
    if (this._client == null) {
      return
    }

    return new Promise((resolve, reject) => {
      try {
        this._client.sendCommand(command, (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(parser(result))
          }
        })
      } catch (ex) {
        console.log('Error: ' + JSON.stringify(ex))
        reject(ex)
      }
    })
  }

  _sendCommands(commands, parser, callback) {
    // Don't send commands if we're disconnected.
    if (this._client == null) {
      return
    }

    return new Promise((resolve, reject) => {
      try {
        this._client.sendCommands(commands, (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(parser(result))
          }
        })
      } catch (ex) {
        console.log('Error: ' + JSON.stringify(ex))
        reject(ex)
      }
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
    return this._sendCommand(cmd('listplaylistinfo', [name]), mpd.parseArrayMessage)
  }

  getPlaylists() {
    return this._sendCommand(cmd('listplaylists', []), mpd.parseArrayMessage)
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

  deleteSongIds(ids) {
    let commands = ids.map((id) => { return cmd('deleteid', [id]) })
    return this._sendCommands(commands, mpd.parseKeyValueMessage)
  }

  addToQueue(items) {
    let commands = items.map((item) => { return cmd('addid', [item.file, item.position]) })
    return this._sendCommands(commands, mpd.parseKeyValueMessage)
  }

  clear() {
    return this._sendCommand(cmd('clear', []), mpd.parseKeyValueMessage)
  }

  moveSong(id, to) {
    return this._sendCommand(cmd('moveid', [id, to]), mpd.parseKeyValueMessage)
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

  setVolume(volume) {
    return this._sendCommand(cmd('setvol', [volume]), mpd.parseKeyValueMessage)
  }

  setConsume(enabled) {
    return this._sendCommand(cmd('consume', [enabled ? '1' : '0']), mpd.parseKeyValueMessage)
  }

  setRandom(enabled) {
    return this._sendCommand(cmd('random', [enabled ? '1' : '0']), mpd.parseKeyValueMessage)
  }

  setRepeat(enabled) {
    return this._sendCommand(cmd('repeat', [enabled ? '1' : '0']), mpd.parseKeyValueMessage)
  }

  crossfade(value) {
    return this._sendCommand(cmd('crossfade', [value]), mpd.parseKeyValueMessage)
  }

  setSingle(value) {
    return this._sendCommand(cmd('single', [value]), mpd.parseKeyValueMessage)
  }

  setReplayGain(value) {
    return this._sendCommand(cmd('replay_gain_mode', [value]), mpd.parseKeyValueMessage)
  }

  getReplayGain() {
    return this._sendCommand(cmd('replay_gain_status', []), mpd.parseKeyValueMessage)
  }

  addToPlaylist(name, files) {
    let commands = files.map((file) => cmd('playlistadd', [name, file]))
    return this._sendCommands(commands, mpd.parseKeyValueMessage)
  }

  deletePlaylist(name) {
    return this._sendCommand(cmd('rm', [name]), mpd.parseKeyValueMessage)
  }

  playlistMove(name, from, to) {
    return this._sendCommand(cmd('playlistmove', [name, from, to]), mpd.parseKeyValueMessage)
  }

  playlistDelete(name, positions) {
    let commands = positions.map((pos) => cmd('playlistdelete', [name, pos]))
    return this._sendCommands(commands, mpd.parseKeyValueMessage)
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

  /// Subscribes to mixer updates: stored playlist changes.
  onPlaylistUpdate(callback) {
    return this._subscribe(Subsystems.STORED_PLAYLIST, callback)
  }
}

