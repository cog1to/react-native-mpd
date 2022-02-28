import React from 'react'
import {
  View,
  StyleSheet,
} from 'react-native'
import { CommonActions } from '@react-navigation/native'

// Items list.
import Browsable from '../components/common/Browsable'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { loadSongs } from '../redux/reducers/library/actions'
import { getAlbumArt } from '../redux/reducers/archive/actions'

class Album extends React.Component {
  static defaultProps = {
    cover: null,
    artistCover: null,
  }

  componentDidMount() {
    const { content } = this.props

    if (content == null) {
      this.reload()
    }
  }

  reload = () => {
    const { loadSongs, content } = this.props
    const { artist, album } = this.props.route.params
    loadSongs(artist, album)
  }

  render() {
    const { navigation, route, content, loading, queueSize, position, cover, artistCover, theme } = this.props
    const { artist, album } = route.params
    let songs = (content != null) ? content : []

    // Check if album has multiple artists. In this case using artist title will be wrong.
    let albumArtist = null, variousArtists = false
    for (var index = 0; index < songs.length; index++) {
      let artist = songs[index].albumArtist != null ? songs[index].albumArtist : songs[index].artist
      
      if (albumArtist == null) {
        albumArtist = artist
      } else if (albumArtist != artist) {
        variousArtists = true
        albumArtist = 'Various Artists'
        break
      }
    }

    // Handling common case with 'VA' abbreviation for 'Various Artists'.
    variousArtists = variousArtists || albumArtist == 'VA'

    // Insert special cover cell.
    const coverItem = {
      name: album,
      type: 'COVER', 
      artist: artist,
      title: album,
      fullPath: cover,
      id: 'cover',
      index: -2,
      subtitle: artist,
      selected: false,
      status: null,
    }

    // Insert special summary cell.
    const titleItem = {
      name: album,
      type: 'TITLE',
      artist: albumArtist != null ? albumArtist : artist,
      title: album,
      fullPath: variousArtists ? null : artistCover,
      id: 'title',
      index: -1,
      subtitle: '' + songs.length + ' song' + (songs.length > 1 ? 's' : ''),
      selected: false,
      status: null,
    }

    if (songs.length > 0) {
      songs.splice(0, 0, coverItem)
      songs.splice(1, 0, titleItem)
    }

    return (
      <View style={styles.container}>
        <Browsable
          content={songs}
          onNavigate={this.onNavigate}
          navigation={navigation}
          refreshing={loading}
          onRefresh={this.reload}
          position={position}
          queueSize={queueSize}
          theme={theme}
          canFilter={true}
          mode='list'
          title={album}
        />
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { position = null, file = null } = state.currentSong
  const { route: { params: { artist, album } } } = ownProps
  const { archive, artists } = state
  const theme = state.storage.theme

  // Supply with item with ID from the Queue, if possible, and playback status.
  let contentWithIds = null

  let library = state.library.library[artist][album]
  if (library != null) {
    contentWithIds = library.map(item => {
      const found = state.queue.find(el => {
        return el.file === item.fullPath
      })

      return {
        ...item,
        id: (found != null ? found.songId : null),
        status: (item.fullPath === file) ? 'play' : 'none',
      }
    })
  }

  // Get album image.
  let url = null
  if (artist in archive && album in archive[artist]) {
    url = archive[artist][album]
  }

  // Get artist image.
  let artistUrl = null
  if (artist in artists) {
    artistUrl = artists[artist].small
  }

  return {
    content: contentWithIds,
    loading: state.library.loading,
    queueSize: state.queue.length,
    position: position,
    cover: url,
    artistCover: artistUrl,
    theme: theme
  }
}

const mapDispatchToProps = dispatch => {
  return {
    loadSongs: (artist, album) => dispatch(loadSongs(artist, album))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Album)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
