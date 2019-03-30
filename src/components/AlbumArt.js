import React from 'react'
import PropTypes from 'prop-types'
import { 
  View, 
  StyleSheet,
  Image,
} from 'react-native'

// Redux.
import { connect } from 'react-redux';

// Actions.
import { getAlbumArt } from '../redux/mpd/Actions'

// Update types.
import * as updateTypes from '../redux/mpd/UpdateTypes'

class AlbumArt extends React.Component {

	componentDidUpdate(prevProps, prevState, snapshot) {
		const { dispatch } = this.props
		const { currentSong: { Id, Album, Artist, AlbumArtist }, uri } = this.props
		const artist = (AlbumArtist ? AlbumArtist : Artist)
		const prevArtist = (prevProps.currentSong !== null ? (prevProps.currentSong.AlbumArtist ? prevProps.currentSong.AlbumArtist : prevProps.currentSong.Artist ) : null)

		if (prevProps.currentSong === null || (prevProps.currentSong.Album !== Album && prevArtist !== artist) || uri === null) {
			dispatch(getAlbumArt(artist, Album))
		}
	}

	render() {
		const { uri } = this.props

		return (
			<View style={styles.container}>
				<Image style={styles.image} source={{uri: uri}} resizeMode='cover' />
			</View>
		)
	}
}

const mapStateToProps = state => {
	const { currentSong } = state

	if (currentSong === null) {
		return {
			currentSong: null,
			uri: null,
		}
	}

    const { Artist, Album, AlbumArtist } = currentSong
    const artist = AlbumArtist ? AlbumArtist : Artist
    
    let uri = null
    if (currentSong !== null && artist in state.archive && Album in state.archive[artist]) {
    	uri = state.archive[artist][Album]
    }

    return {
        currentSong: currentSong,
        uri: uri
    }
}

export default connect(mapStateToProps, null)(AlbumArt)

const styles = StyleSheet.create({
	container: {
		aspectRatio: 1,
		width:'100%',
	},
	image: {
		flex: 1,
	}
})