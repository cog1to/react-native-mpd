import React from 'react'
import PropTypes from 'prop-types'
import { 
  View, 
  StyleSheet,
  Slider,
  Text,
} from 'react-native'

// Redux.
import { connect } from 'react-redux';

// Actions.
import { addListener, removeListener } from '../redux/reducers/listeners/actions'
import { seek } from '../redux/reducers/player/actions'

// Subsystems.
import { SUBSYSTEMS } from '../redux/reducers/listeners/types'

class SongProgress extends React.Component {
	static defaultProps = {
		player: 'stop',
		duration: 1,
		elapsed: 0,
	}

	state = {
    	dragging: false,
    	value: null,
  	}

  	formatTime = (time) => {
  		const minutes = Math.floor(time/60).toString()
  		const seconds = Math.floor(time % 60).toString()

  		return minutes + ":" + (seconds.length === 1 ? "0" + seconds : seconds)
  	}

	onValueChange = (value) => {
		this.setState({
			dragging: true,
			value
		})
	}

	onSlidingComplete = () => {
		const { value } = this.state
		const { seek } = this.props

		this.setState({
			dragging: false,
		})
		seek(value)
	}

	componentWillReceiveProps(nextProps) {
		const { player, addListener, removeListener } = nextProps
		if (player === 'play') {
			addListener()
		} else {
			removeListener()
		}
	}

	render() {
		const { player, duration, elapsed } = this.props
		const { value, dragging } = this.state

		const disabled = player === 'stop'
		const style = disabled ? styles.disabled : styles.enabled

		const minimumValue = 0
		
		return (
			<View style={[this.props.style, styles.container]}>
				<Slider 
					style={style}
					minimumValue={0} 
					maximumValue={duration}
					step={0.5}
					value={dragging ? value : elapsed}
					disabled={disabled}
					onValueChange={this.onValueChange}
					onSlidingComplete={this.onSlidingComplete}
				/>
				{!disabled && (
					<View style={styles.time}>
						<Text
							style={styles.timeText}
						>
							{this.formatTime(elapsed)}
						</Text>
						<Text
							style={styles.timeText}
						>
							{this.formatTime(duration)}
						</Text>
					</View>
				)}
			</View>
		)
	}
}

const mapStateToProps = state => {
    const { player, elapsed, duration } = state.status

    return {
        player,
        elapsed,
        duration,
    }
}

const mapDispatchToProps = dispatch => {
	return {
		addListener: () => { dispatch(addListener(SUBSYSTEMS.PROGRESS, 'player-progress')) },
		removeListener: () => { dispatch(removeListener(SUBSYSTEMS.PROGRESS, 'player-progress')) },
		seek: (position) => { dispatch(seek(position)) },
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SongProgress)

const styles = StyleSheet.create({
	time: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	timeText: {
		fontSize: 16
	},
	enabled: {
		color: 'black',
	},
	disabled: {
		color: 'lightgray',
	}
})