import React from 'react'
import {
  View,
  StyleSheet,
} from 'react-native'
import { NavigationActions } from 'react-navigation'

// Items list.
import Browsable from '../components/common/Browsable'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { loadSongs } from '../redux/reducers/library/actions'

class Album extends React.Component {
  componentDidMount() {
    const { content } = this.props

    if (content == null) {
      this.reload()
    }
  }

  reload = () => {
    const { loadSongs, content } = this.props
    const { artist, album } = this.props.navigation.state.params
    loadSongs(artist, album)
  }

  render() {
    const { navigation, content, loading, queueSize, position } = this.props
    const songs = (content != null) ? content : []

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
        />
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { position = null, file = null } = state.currentSong
  const { navigation: { state: { params: { artist, album } } } } = ownProps

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

  return {
    content: contentWithIds,
    loading: state.library.loading,
    queueSize: state.queue.length,
    position: position,
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
