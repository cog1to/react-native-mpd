import { combineReducers } from 'redux'

// Reducers.
import { archiveReducer } from './reducers/archive/reducer'
import { statusReducer } from './reducers/status/reducer'
import { currentSongReducer } from './reducers/currentsong/reducer'
import { queueReducer } from './reducers/queue/reducer'

const reducer = combineReducers({
	archive: archiveReducer,
	status: statusReducer,
	queue: queueReducer,
	currentSong: currentSongReducer,
})

export default reducer