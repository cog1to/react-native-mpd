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
import { loadArtists } from '../redux/reducers/library/actions'
import { saveLibraryMode } from '../redux/reducers/storage/actions'

// Items list.
import Browsable from '../components/common/Browsable'

class Library extends React.Component {
  componentDidMount() {
    const { content, mode } = this.props

    console.log('*** mode:' + mode)

    if (content === null) {
      this.reload()
    }
  }

  reload = () => {
    const { loadArtists } = this.props
    loadArtists()
  }

  render() {
    const { content, navigation, loading, queueSize, position, mode } = this.props
    const artists = ((content !== null) ? Object.keys(content) : []).map((name, index) => ({
      icon: index + 1,
      title: name,
      subtitle: 'ARTIST',
      name: name,
      type: 'ARTIST',
      path: name,
      status: 'none',
    }))

    return (
      <View style={styles.container}>
        <Browsable
          content={artists}
          onNavigate={this.onNavigate}
          navigation={navigation}
          onRefresh={this.reload}
          refreshing={loading}
          queueSize={queueSize}
          mode={mode}
          onIconTapped={this.onModeSelected}
      />
      </View>
    )
  }

  onNavigate = (item) => {
    const { navigation } = this.props

    const action = NavigationActions.navigate({
      params: {
        name: item.name,
      },
      routeName: 'Artist',
    })
    navigation.dispatch(action)
  }

  onModeSelected = (icon) => {
    let switchMode = (mode) => {
      this.props.saveLibraryMode(mode)
      this.props.navigation.setParams({
        mode: mode
      })
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
  const { library, loading } = state.library
  const { mode } = state.storage
  const { position = null, file = null } = state.currentSong

  return {
    content: library,
    loading: loading,
    queueSize: state.queue.length,
    mode,
    position,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    loadArtists: () => dispatch(loadArtists()),
    saveLibraryMode: (mode) => dispatch(saveLibraryMode(mode)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Library)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
