import React from 'react'
import PropTypes from 'prop-types'
import { 
  View, 
  StyleSheet,
  Text,
  FlatList,
} from 'react-native'

// Song prop types.
import { queuePropTypes } from '../redux/reducers/queue/reducer'

// Redux.
import { connect } from 'react-redux';

// Actions.
import { setCurrentSong }  from '../redux/reducers/queue/actions'

// List item.
import QueueListItem from './QueueListItem'

class QueueList extends React.Component {
	
	static propTypes = {
		queue: PropTypes.arrayOf(PropTypes.shape({
			name: PropTypes.string.isRequired,
			subtitle: PropTypes.string,
			playing: PropTypes.bool.isRequired,
		}))
	}

	static defaultProps = {
		queue: [],
	}

	render() {
		return (
			<FlatList style={styles.container}
				data={this.props.queue}
		        keyExtractor={this.keyExtractor}
		        renderItem={this.renderItem}
			/>
		)
	}

	keyExtractor = (item, index) => item.songId

	renderItem = ({item}) => {
		return <QueueListItem
			id={item.songId}
			name={item.name}
			subtitle={item.subtitle}
			playing={item.playing}
			onPressItem={this.onPressItem}
		/>
	}

	onPressItem = (id: string) => {
    	const { play } = this.props
    	play(id)
  	}
}

const queueToList = (state) => {
	const currentSongId = state.status.player === 'stop' ? null : state.currentSong.songId

	return state.queue.map(song => {
		let name = song.title
		if (name === null) {
			name = song.file
		}

		let artist = song.artist

		return {
			songId: song.songId,
			name: name,
			subtitle: artist,
			playing: song.songId === currentSongId
		}
	})
}

const mapStateToProps = state => {
    return {
    	queue: queueToList(state),    	
    }
}

const mapDispatchToProps = dispatch => {
	return {
		play: (songId) => {
			dispatch(setCurrentSong(songId))
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(QueueList)

const styles = StyleSheet.create({
	container: {
		flex: 1,
	}
})
