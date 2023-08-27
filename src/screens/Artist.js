import React from 'react'
import {
  StyleSheet,
  View,
  FlatList,
  Text,
} from 'react-native'
import { StackActions } from '@react-navigation/native'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { loadAlbums } from '../redux/reducers/library/actions'
import { saveLibraryMode } from '../redux/reducers/storage/actions'

// Items list.
import Browsable from '../components/common/Browsable'

class Artist extends React.Component {
  componentDidMount() {
    const { content, mode } = this.props

    if (content == null) {
      this.reload()
    }
  }

  reload = () => {
    const { content, loadAlbums, navigation, route } = this.props
    const artistName = route.params.name
    loadAlbums(artistName)
  }

  render() {
    const { content, navigation, route, loading, queueSize, position, mode, theme } = this.props
    const { params: { adjustButtons } } = route

    let albums = ((content !== null) ? Object.keys(content) : []).map((name, index) => ({
      icon: index + 1,
      name: name,
      type: 'ALBUM',
      path: name,
      subtitle: route.params.name,
      status: 'none',
      artist: route.params.name,
      data: { album: name, artist: route.params.name },
    }))

    return (
      <View style={styles.container}>
        <Browsable
          adjustButtons={2}
          content={albums}
          onNavigate={this.onNavigate}
          navigation={navigation}
          refreshing={loading}
          onRefresh={this.reload}
          queueSize={queueSize}
          position={position}
          mode={mode}
          theme={theme}
          canFilter={true}
          canSelectMode={true}
          onIconTapped={this.onModeSelected}
          title={route.params.name}
        />
      </View>
   )
  }

  onNavigate = (item) => {
    const { navigation, route } = this.props
    const artistName = route.params.name

    const action = StackActions.push('Album', {
      album: item.name,
      artist: artistName,
    })
    navigation.dispatch(action)
  }

  onModeSelected = (icon) => {
    let switchMode = (mode) => {
      this.props.saveLibraryMode(mode)
    }

    if (icon === 'view-list') {
      switchMode('list')
    } else if (icon === 'view-module') {
      switchMode('tiles')
    } else {
      console.log('Unknown library visual mode')
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  const { position = null, file = null } = state.currentSong
  const { mode } = state.storage
  const { route: { params: { name } } } = ownProps
  const theme = state.storage.theme

  return {
    content: state.library.library[name],
    loading: state.library.loading,
    queueSize: state.queue.length,
    theme: theme,
    position,
    mode,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    loadAlbums: (artist) => dispatch(loadAlbums(artist)),
    saveLibraryMode: (mode) => dispatch(saveLibraryMode(mode)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Artist)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

