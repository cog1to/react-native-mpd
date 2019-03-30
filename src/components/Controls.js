import React from 'react'
import PropTypes from 'prop-types'
import { 
  View, 
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native'
import FontAwesome, { Icons } from 'react-native-fontawesome'

// Redux.
import { connect } from 'react-redux';

// Actions.
import { listenFor, playPause, playNext, playPrevious } from '../redux/mpd/Actions'

// Update types.
import * as updateTypes from '../redux/mpd/UpdateTypes'

class Controls extends React.Component {
	static defaultProps = {
		state: 'stop',
	}

	componentDidMount() {
		const { addListener } = this.props
		addListener()
	}

	componentWillUnmount() {
		const { removeListener } = this.props
		removeListener()
	}

	playPause = () => {
		const { onPlayPause, state } = this.props
		
		if (state === 'play') {
			onPlayPause('pause')
		} else {
			onPlayPause('play')
		}
	}

	previous = () => {
		const { onPrevious } = this.props
		onPrevious()
	}

	next = () => {
		const { onNext } = this.props
		onNext()
	}

	render() {
		let { state } = this.props

		const style = state === 'stop' ? styles.disabled : styles.enabled

		return (
			<View style={styles.container}>
				<TouchableOpacity onPress={this.previous}>
					<Text style={[styles.text, style]}>
						<FontAwesome>{Icons.stepBackward}</FontAwesome>
					</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={this.playPause}>
					<Text style={[styles.text, style]}>
						<FontAwesome>{state == 'pause' ? Icons.play : Icons.pause}</FontAwesome>
					</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={this.next}>
					<Text style={[styles.text, style]}>
						<FontAwesome>{Icons.stepForward}</FontAwesome>
					</Text>
				</TouchableOpacity>
			</View>
		)
	}
}

const mapStateToProps = state => {	
    const playerState = (state.state !== null) ? state.state : 'stop'
    
    return {
        state: playerState
    }
}

const mapDispatchToProps = dispatch => {
	return {
		onPlayPause: (state) => { dispatch(playPause(state)) },
		onNext: () => { dispatch(playNext()) },
		onPrevious: () => { dispatch(playPrevious()) },
		addListener: () => { dispatch(listenFor(updateTypes.STATUS, 'player-controls', true)) },
		removeListener: () => { dispatch(listenFor(updateTypes.STATUS, 'player-controls', false)) },
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls)

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'center',
        height: 50,
	},
	text: {
		width: 60,
		textAlign: 'center',
		flexGrow: 1,
	},
	enabled: {
		fontSize: 30,
		color: 'black',
	},
	disabled: {
		fontSize: 30,
		color: 'lightgray',
	}
})