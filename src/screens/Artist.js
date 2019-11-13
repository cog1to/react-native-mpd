import React from 'react'
import {
  StyleSheet,
  View,
  FlatList,
  Text,
} from 'react-native'
import { NavigationActions } from 'react-navigation'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { loadAlbums } from '../redux/reducers/library/actions'

// Items list.
import Browsable from '../components/common/Browsable'

class Artist extends React.Component {
  componentWillMount() {
    const { content } = this.props
    if (content == null) {
      this.reload()
    }
  }

  reload = () => {
    const { content, loadAlbums, navigation } = this.props
    const artistName = navigation.state.params.name

    loadAlbums(artistName)
  }

  render() {
    const { content, navigation, loading, queueSize, position } = this.props

    let albums = ((content !== null) ? Object.keys(content) : []).map((name, index) => ({
      icon: index + 1,
      name: name,
      type: 'ALBUM',
      path: name,
      subtitle: navigation.state.params.name,
      status: 'none',
      artist: navigation.state.params.name,
      data: { album: name, artist: navigation.state.params.name },
    }))

    return (
      <View style={styles.container}>
        <Browsable
          content={albums}
          onNavigate={this.onNavigate}
          navigation={navigation}
          refreshing={loading}
          onRefresh={this.reload}
          queueSize={queueSize}
          position={position}
        />
      </View>
   )
  }

  onNavigate = (item) => {
    const { navigation } = this.props
    const artistName = navigation.state.params.name

    const action = NavigationActions.navigate({
      params: {
        album: item.name,
        artist: artistName,
      },
      routeName: 'Album',
    })
    navigation.dispatch(action)
  }
}

const mapStateToProps = (state, ownProps) => {
  const { position = null, file = null } = state.currentSong
  const { navigation: { state: { params: { name } } } } = ownProps

  return {
    content: state.library.library[name],
    loading: state.library.loading,
    queueSize: state.queue.length,
    position: position,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    loadAlbums: (artist) => dispatch(loadAlbums(artist))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Artist)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

