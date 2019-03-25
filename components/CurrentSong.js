import React from 'react'
import PropTypes from 'prop-types'
import { 
  View, 
  StyleSheet,
  Text,
} from 'react-native'

export default class CurrentSong extends React.Component {
	render() {
		const { song } = this.props
		if (!song) return null

		const { Title, Album, Artist } = song
		return (
			<View style={styles.container}>
				<Text style={styles.songName}>{Title}</Text>
				<Text style={styles.albumName}>{Artist} - {Album}</Text>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		alignItems: 'center',
	},
	songName: {
		fontWeight: 'bold',
		fontSize: 20,
		color: 'black',
	},
	albumName: {
		fontSize: 16,
	},
})