import * as archiveTypes from './reducers/archive/types'
import * as currentSongTypes from './reducers/currentsong/types'
import * as playerTypes from './reducers/player/types'
import * as queueTypes from './reducers/queue/types'
import * as statusTypes from './reducers/status/types'

const types = {
	...archiveTypes,
	...currentSongTypes,
	...playerTypes,
	...queueTypes,
	...statusTypes,
}

export default types
