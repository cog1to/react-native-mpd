import * as archiveTypes from './reducers/archive/types'
import * as currentSongTypes from './reducers/currentsong/types'
import * as playerTypes from './reducers/player/types'
import * as queueTypes from './reducers/queue/types'
import * as statusTypes from './reducers/status/types'
import * as browserTypes from './reducers/browser/types'
import * as searchTypes from './reducers/search/types'
import * as libraryTypes from './reducers/library/types'
import * as storageTypes from './reducers/storage/types'
import * as playlistsTypes from './reducers/playlists/types'
import * as artistsTypes from './reducers/artists/types'
import * as outputsTypes from './reducers/outputs/types'

const types = {
  ...archiveTypes,
  ...currentSongTypes,
  ...playerTypes,
  ...queueTypes,
  ...statusTypes,
  ...browserTypes,
  ...searchTypes,
  ...libraryTypes,
  ...storageTypes,
  ...playlistsTypes,
  ...artistsTypes,
  ...outputsTypes,
}

export default types

