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
import { listenFor } from '../redux/mpd/Actions'

// Update types.
import * as updateTypes from '../redux/mpd/UpdateTypes'

class CurrentSong extends React.Component {

	componentWillUnmount() {
		const { dispatch } = this.props
		dispatch(listenFor(updateTypes.CURRENT_SONG, 'current-song', false))
	}

	componentDidMount() {
		const { dispatch } = this.props
		dispatch(listenFor(updateTypes.CURRENT_SONG, 'current-song', true))
	}

	render() {
		const { currentSong, state } = this.props
		if (!currentSong) return null

		const { Title, Album, Artist, file } = currentSong		

		console.log('state == ' + state)

		if (state === 'stop') {
			return (
				<View style={styles.container}>
					<Text style={styles.songName}>Player is stopped</Text>
				</View>
			)
		} else {
			return (
				<View style={styles.container}>					
					{Title && (<Text style={styles.songName}>{Title}</Text>)}
					{!Title && file && (<Text style={styles.songName}>{file}</Text>)}
					{!Title && !file && (<Text style={styles.songName}>---</Text>)}
				
					{Artist && (<Text style={styles.albumName}>{Artist} - {Album ? Album : '[Unknown album]'}</Text>)}
					{!Artist && (<Text style={styles.albumName}>---</Text>)}
				</View>
			)
		}
	}
}

const mapStateToProps = state => {
    let currentSong = state.currentSong
    return {
        currentSong: currentSong,
        state: state.state,
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