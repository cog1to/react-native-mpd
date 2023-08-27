import React from 'react'
import {
  View,
  StyleSheet,
  Platform,
  BackHandler,
  LayoutAnimation,
  UIManager,
} from 'react-native'

// Navigation.
import { CommonActions } from '@react-navigation/native'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { getPlaylists, newPlaylist, deletePlaylists } from '../redux/reducers/playlists/actions'

// Items list.
import Browsable from '../components/common/Browsable'

// Date parsing.
import Moment from 'moment'

// New playlist dialog.
import AppPromptDialog from '../components/common/AppPromptDialog'

// Delete dialog.
import AppDialog from '../components/common/AppDialog'

// Enable animations on Android.
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MainLayoutAnimation = {
  duration: 200,
  create: {
    type: LayoutAnimation.Types.linear,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  delete: {
    type: LayoutAnimation.Types.linear,
    property: LayoutAnimation.Properties.opacity,
  }
}

class Playlists extends React.Component {
  state = {
    showingNewDialog: false,
  }

  componentDidMount() {
    Moment.locale('en')
    this.reload()
  }

  reload = () => {
    const { getPlaylists } = this.props
    getPlaylists()
  }

  onNavigate = (item) => {
    const { navigation } = this.props

    const action = CommonActions.navigate({
      params: {
         name: item.name,
      },
      name: 'Playlist',
      key: 'Playlist-' + item.name,
    })
    navigation.dispatch(action)
  }

  onRefresh = () => {
    this.reload()
  }

  render() {
    const { content, navigation, refreshing, queueSize, theme, route } = this.props
    const { showingNewDialog } = this.state

    const callback = route.params?.callback ?? null
    const canAddItems = callback == null
    const onSelection = callback != null ? (item) => { callback(item.name) } : null

    let deletePrompt = 'Delete selected playlists?'

    return (
      <View style={styles.container}>
        <Browsable
          adjustButtons={1}
          content={content}
          onNavigate={this.onNavigate}
          refreshing={refreshing}
          onRefresh={this.onRefresh}
          onSelection={onSelection}
          queueSize={queueSize}
          canAdd={canAddItems}
          canEdit={canAddItems}
          canDelete={true}
          canSwipeDelete={false}
          navigation={navigation}
          onDeleteItems={this.handleDelete}
          deletePrompt={{single: 'Delete selected playlist?', multiple: 'Delete %% selected playlists?'}}
          defaultIcon={callback != null ? 'add' : null}
          onIconTapped={this.handleMenuPress}
          theme={theme}
          mode='list'
          title={route.title}
        />
        {showingNewDialog && (
          <AppPromptDialog
            prompt='Create new playlist:'
            placeholder='Playlist name'
            cancelButton={{
              title: 'Cancel',
              onPress: this.handleDailogCancel
            }}
            confirmButton={{
              title: 'Create',
              onPress: this.handleDialogConfirm
            }}
            theme={theme}
          />
        )}
      </View>
    )
  }

  // Delete playlists dialog.
  
  handleDelete = (items) => {
    const names = items.map((item) => { return item.name })
    const { deletePlaylists } = this.props
    deletePlaylists(names)
  }

  // New Playlist dialog.

  handleMenuPress = () => {
    LayoutAnimation.configureNext(MainLayoutAnimation)
    this.setState({
      showingNewDialog: true,
    })
  }

  handleDailogCancel = () => {
    LayoutAnimation.configureNext(MainLayoutAnimation)
    this.setState({
      showingNewDialog: false,
    })
  }

  handleDialogConfirm = (name) => {
    const { navigation, route } = this.props
    const { params: { callback = null } } = route
    if (callback) {
      callback(name)
    }
  }
}

const mapStateToProps = state => {
  const getLastModified = (item) => {
    return 'Last updated at ' + Moment(item.lastModified).format('HH:mm, MMM D, YYYY')
  }

  let content = (state.playlists.playlists != null ? state.playlists.playlists : []).map(item => {
    return {
      ...item,
      artist: getLastModified(item),
      status: 'none',
    }
  })

  content.sort((a, b) => {
    if (a.name < b.name) {
      return -1
    }
    if (a.name > b.name) {
      return 1
    }
    return 0
  })

  return {
    content: content,
    refreshing: state.playlists.loading,
    queueSize: state.queue.length,
    position: state.currentSong.position,
    theme: state.storage.theme
  }
}

const mapDispatchToProps = dispatch => ({
  getPlaylists: () => dispatch(getPlaylists()),
  deletePlaylists: (names) => dispatch(deletePlaylists(names)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Playlists)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})
