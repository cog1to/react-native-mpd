import React from 'react'
import PropTypes from 'prop-types'
import { 
  View, 
  StyleSheet,
  Image,
} from 'react-native'

export default class AlbumArt extends React.Component {
	render() {
		return (
			<View style={styles.container} >
				<Image style={styles.image} />
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		elevation: 5, 
		backgroundColor: 'rgba(205,255,255,1)', 
		width: '100%', 
		height: undefined, 
		aspectRatio: 1
	},
	image: {
		flex: 1
	}
})