import React from 'react'
import PropTypes from 'prop-types'
import { 
  View, 
  StyleSheet,
  Text,
} from 'react-native'
import FontAwesome, { Icons } from 'react-native-fontawesome'

export default class Controls extends React.Component {
	static defaultProps = {
		state: 'stop',
	}

	render() {
		let { state } = this.props

		const style = state === 'stop' ? styles.disabled : styles.enabled

		return (
			<View style={[this.props.style, styles.container]}>
				<Text style={style}>
					<FontAwesome>{Icons.backward}</FontAwesome>
				</Text>
				<Text style={style}>
					<FontAwesome>{Icons.play}</FontAwesome>
				</Text>
				<Text style={style}>
					<FontAwesome>{Icons.forward}</FontAwesome>
				</Text>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'space-between',
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