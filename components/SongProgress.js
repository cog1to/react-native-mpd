import React from 'react'
import PropTypes from 'prop-types'
import { 
  View, 
  StyleSheet,
  Slider,
} from 'react-native'

export default class SongProgress extends React.Component {
	static defaultProps = {
		state: 'stop',
		duration: 1,
		elapsed: 0,
	}

	render() {
		const { state, duration, elapsed } = this.props

		console.log(state, duration, elapsed)

		const disabled = state === 'stop'
		const style = disabled ? styles.disabled : styles.enabled

		const minimumValue = 0
		
		return (
			<View style={[this.props.style, styles.container]}>
				<Slider 
					style={style}
					minimumValue={0} 
					maximumValue={duration}					
					step={0.01}
					value={elapsed}
					disabled={disabled} 					
				/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		
	},
	enabled: {
		color: 'black',
	},
	disabled: {
		color: 'lightgray',
	}
})