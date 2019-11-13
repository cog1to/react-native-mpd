import { combineReducers } from 'redux'

// Reducers.
import { archiveReducer } from './reducers/archive/reducer'
import { statusReducer } from './reducers/status/reducer'
import { currentSongReducer } from './reducers/currentsong/reducer'
import { queueReducer } from './reducers/queue/reducer'
import { browserReducer } from './reducers/browser/reducer'
import { searchReducer } from './reducers/search/reducer'
import { libraryReducer } from './reducers/library/reducer'
import { storageReducer } from './reducers/storage/reducer'
import { playlistsReducer } from './reducers/playlists/reducer'
import { artistsReducer } from './reducers/artists/reducer'

const reducer = combineReducers({
  archive: archiveReducer,
  status: statusReducer,
  queue: queueReducer,
  currentSong: currentSongReducer,
  browser: browserReducer,
  search: searchReducer,
  library: libraryReducer,
  storage: storageReducer,
  playlists: playlistsReducer,
  artists: artistsReducer,
})

export default reducer
