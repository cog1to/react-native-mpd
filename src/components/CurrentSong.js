import React from 'react'
import PropTypes from 'prop-types'
import { 
  View, 
  StyleSheet,
  Text,
} from 'react-native'

// Redux.
import { connect } from 'react-redux';

// Actions.
import { addListener, removeListener } from '../redux/reducers/listeners/actions'

// Subsystems.
import { SUBSYSTEMS } from '../redux/reducers/listeners/types'

class CurrentSong extends React.Component {

	componentWillUnmount() {
		const { dispatch } = this.props
		dispatch(removeListener(SUBSYSTEMS.CURRENT_SONG, 'current-song'))
	}

	componentDidMount() {
		const { dispatch } = this.props
		dispatch(addListener(SUBSYSTEMS.CURRENT_SONG, 'current-song'))
	}

	render() {
		const { currentSong, state } = this.props
		if (!currentSong) return null

		const { title, album, artist, file } = currentSong		

		if (state === 'stop') {
			return (
				<View style={styles.container}>
					<Text style={styles.songName}>Player is stopped</Text>
				</View>
			)
		} else {
			return (
				<View style={styles.container}>					
					{title && (<Text style={styles.songName}>{title}</Text>)}
					{!title && file && (<Text style={styles.songName}>{file}</Text>)}
					{!title && !file && (<Text style={styles.songName}>---</Text>)}
				
					{artist && (<Text style={styles.albumName}>{artist} - {album ? album : '[Unknown album]'}</Text>)}
					{!artist && (<Text style={styles.albumName}>---</Text>)}
				</View>
			)
		}
	}
}

const mapStateToProps = state => {
    let currentSong = state.currentSong
    return {
        currentSong: currentSong,
        state: state.status.player,
    }
}

export default connect(mapStateToProps, null)(CurrentSong)

const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		alignItems: 'center',
	},
	songName: {
		fontWeight: 'bold',
		fontSize: 20,
		color: 'black',
		textAlign: 'center',
	},
	albumName: {
		fontSize: 16,
		textAlign: 'center',
	},
})