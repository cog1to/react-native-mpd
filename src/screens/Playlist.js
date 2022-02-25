import React from 'react'

import {
  View,
  StyleSheet,
} from 'react-native'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { getPlaylist, playlistMove, playlistDelete } from '../redux/reducers/playlists/actions'

// Items list.
import Browsable from '../components/common/Browsable'

class Playlist extends React.Component {
  componentDidMount() {
    this.reload()
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.content.length != 0 && nextProps.content.length == 0) {
      return false
    }

    return true
  }

  reload = () => {
    const { navigation, route, getPlaylist } = this.props
    const { params: { name } } = route
    getPlaylist(name)
  }

  render() {
    const { content, navigation, refreshing, queueSize, position, theme } = this.props

    return (
      <View style={styles.container}>
        <Browsable
          content={content} 
          navigation={navigation}
          refreshing={refreshing}
          onRefresh={this.reload}
          canEdit={true}
          canDelete={true}
          canRearrange={true}
          queueSize={queueSize}
          position={position}
          onItemMoved={this.handleItemMove}
          onDeleteItems={this.handleItemsDelete}
          confirmDelete={false}
          theme={theme}
        />
      </View>
    )
  }

  // Events.
  
  handleItemMove = (data) => {
    const { from, to } = data
    const { playlistMove, route: { params: { name } } } = this.props

    playlistMove(name, from, to)
  }

  handleItemsDelete = (items) => {
    const { playlistDelete, route: { params: { name } } } = this.props

    playlistDelete(name, items.map(item => { return item.index }))
  }
}

const mapStateToProps = (state, ownProps) => {
  const { route: { params: { name = null } } } = ownProps
  const playlist = state.playlists.playlists.find(item => { return item.name == name })
  const { position = null, file = null } = state.currentSong

  // Supply with item with ID from the Queue, if possible, and playback status.
  let contentWithIds = (playlist.tracks != null ? playlist.tracks : []).map(item => {
    const found = state.queue.find(el => {
      return el.file === item.fullPath
    })

    return {
      ...item,
      id: (found != null ? found.songId : null),
      status: (item.fullPath === file) ? 'play' : 'none',
    }
  })

  let queueSize = state.queue.length

  return {
    content: contentWithIds,
    refreshing: state.playlists.loading,
    queueSize: queueSize,
    position: position,
    theme: state.storage.theme
  }
}

const mapDispatchToProps = dispatch => ({
  getPlaylist: (name) => { dispatch(getPlaylist(name)) },
  playlistMove: (name, from, to) => { dispatch(playlistMove(name, from, to)) },
  playlistDelete: (name, indices) => { dispatch(playlistDelete(name, indices)) },
})

export default connect(mapStateToProps, mapDispatchToProps)(Playlist)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})
