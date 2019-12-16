import React from 'react'
import PropTypes from 'prop-types'
import {
  View,
  StyleSheet,
  Image,
} from 'react-native'

// Redux.
import { connect } from 'react-redux';

class AlbumArt extends React.Component {

  state = {
    failed: false,
  }

  render() {
    const { uri } = this.props
    const { failed } = this.state
    const imageUri = (failed != true && uri !== null)
      ? {uri: uri}
      : require('../../assets/images/unknown-album-art-borderless.png')

    return (
      <View style={styles.container}>
        <Image style={styles.image} source={imageUri} resizeMode='contain' cache='default' onError={this.onError} />
      </View>
    )
  }

  onError = () => {
    this.setState({ failed: true })
  }
}

const uriFromState = (state) => {
  const { artist, album, albumArtist } = state.currentSong
  const realArtist = albumArtist ? albumArtist : artist

  let uri = null
  if (state.currentSong !== null && realArtist in state.archive && album in state.archive[realArtist]) {
    uri = state.archive[realArtist][album]
  }

  return uri
}

const mapStateToProps = state => {
  return {
    currentSong: state.currentSong,
    uri: uriFromState(state),
  }
}

export default connect(mapStateToProps, null)(AlbumArt)

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
    maxWidth:'100%',
    padding: 10,
  },
  image: {
    flex: 1,
    maxWidth:'100%',
    maxHeight:'100%',
  }
})
