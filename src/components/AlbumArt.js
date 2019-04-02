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
import { getAlbumArt } from '../redux/reducers/archive/actions'

class AlbumArt extends React.Component {

	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('*** updating component')

		const { dispatch } = this.props
		const { currentSong: { album, albumArtist, artist, songid }, uri } = this.props
		const nextArtist = (albumArtist ? albumArtist : artist)
		const prevArtist = (prevProps.currentSong !== null ? (prevProps.currentSong.albumArtist ? prevProps.currentSong.albumArtist : prevProps.currentSong.artist ) : null)

		if (prevProps.currentSong === null || (prevProps.currentSong.album !== album && prevArtist !== nextArtist) || uri === null) {
			console.log('*** getting album art')			
			dispatch(getAlbumArt(nextArtist, album))
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
	console.log('*** mapping state to AlbumArt')
	const { artist, album, albumArtist } = state.currentSong
	const realArtist = albumArtist ? albumArtist : artist
    
    let uri = null
    if (state.currentSong !== null && artist in state.archive && album in state.archive[realArtist]) {
    	uri = state.archive[realArtist][album]
    }

    return {
        currentSong: state.currentSong,
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