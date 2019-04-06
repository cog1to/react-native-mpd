import React from 'react'
import PropTypes from 'prop-types'
import { 
  View, 
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native'
import FontAwesome, { Icons } from 'react-native-fontawesome'

export default class QueueListItem extends React.Component {

	onPress = () => {
    	this.props.onPressItem(this.props.id, this.props.status)
  	}

	render() {
		const { name, subtitle, status, id } = this.props

		return (
			<View>
				<View style={styles.foreground}>
					<TouchableOpacity onPress={this.onPress}>
						<View style={styles.container}>
							{status !== null && (
								<Text style={[styles.status, styles.statusActive]}>
									<FontAwesome>{status === 'play' ? Icons.play : Icons.pause  }</FontAwesome>
								</Text>
							)}
							{status === null && (
								<Text style={[styles.status, styles.statusInactive]}>
									{id}
								</Text>
							)}
							<View style={styles.description}>
								<Text style={styles.title} ellipsizeMode='tail' selectable={false} numberOfLines={1}>{name}</Text>
								{subtitle && (<Text style={styles.subtitle}>{subtitle}</Text>)}
							</View>
						</View>
					</TouchableOpacity>
				</View>
				<View style={styles.background}>
				</View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center',
	},
	status: {
		width: 60,
		textAlign: 'center',
		aspectRatio: 1,
		alignSelf: 'stretch',
		textAlignVertical: 'center',
		fontSize: 12,
	},
	statusActive: {
		color: 'black',
	},
	statusInactive: {
		color: 'grey',
	},
	description: {
		flex: 1,
		flexDirection: 'column',
		marginRight: 10,
	},
	title: {		
		fontWeight: 'bold',
		fontSize: 16,
		color: 'black',		
	},
	subtitle: {
		fontSize: 14,
	},
	foreground: {
		zIndex: 2, 
		backgroundColor: 'white'
	},
	background: {
		zIndex: 1,
		position: 'absolute',
		height: '100%',
		width: '100%',
		backgroundColor: 'gray',
	}
})