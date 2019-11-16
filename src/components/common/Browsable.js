import React from 'react'

import {
  View,
  StyleSheet,
  Text,
  Platform,
  BackHandler,
  LayoutAnimation,
  UIManager,
} from 'react-native'

// Navigation.
import { NavigationActions, StackActions } from 'react-navigation'

// Prop Types.
import PropTypes from 'prop-types'

// List.
import UniversalList from './UniversalList'

// Menu dialog.
import MenuDialog from './MenuDialog'

// Delete dialog.
import AppDialog from './AppDialog'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { addToQueue, addToQueuePlay } from '../../redux/reducers/browser/actions'
import { addToPlaylist } from '../../redux/reducers/playlists/actions'

// Add options.
export const OPTIONS = { 
  ADD_TO_QUEUE_BEGINNING: { value: 'ADD_TO_QUEUE_BEGINNING', title: 'At the beginning of queue' },
  ADD_TO_QUEUE_END: { value: 'ADD_TO_QUEUE_END', title: 'At the end of queue' },
  ADD_TO_QUEUE_AFTER_CURRENT_SONG: { value: 'ADD_TO_QUEUE_AFTER_CURRENT_SONG', title: 'After current song' },
  ADD_TO_PLAYLIST: { value: 'ADD_TO_PLAYLIST', title: 'To a playlist' }
}

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

class Browsable extends React.Component {
  static propTypes = {
    content: PropTypes.array.isRequired,
    onNavigate: PropTypes.func,
    onRefresh: PropTypes.func,
    refreshing: PropTypes.bool,
    queueSize: PropTypes.number.isRequired,
    position: PropTypes.number,
    canAdd: PropTypes.bool.isRequired,
    canEdit: PropTypes.bool.isRequired,
    canDelete: PropTypes.bool.isRequired,
    canRearrange: PropTypes.bool.isRequired,
    addOptions: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })),
    deletePrompt: PropTypes.shape({
      single: PropTypes.string.isRequired,
      multiple: PropTypes.string.isRequired,
    }),
    confirmDelete: PropTypes.bool.isRequired,
    onDeleteItems: PropTypes.func,
  }

  state = {
    selected: [],
    editing: false,
    showingMenu: false,
    showingDeleteDialog: false,
    refreshing: false,
    position: null,
  }

  static defaultProps = {
    addOptions: [
      OPTIONS.ADD_TO_QUEUE_BEGINNING,
      OPTIONS.ADD_TO_QUEUE_END,
      OPTIONS.ADD_TO_QUEUE_AFTER_CURRENT_SONG,
      OPTIONS.ADD_TO_PLAYLIST,
    ],
    canAdd: true,
    canEdit: true,
    canDelete: false,
    canRearrange: false,
    deletePrompt: null,
    onItemMoved: null,
    confirmDelete: true,
    onRefresh: null,
    refreshing: null,
  }

  // Global handlers.
  
  componentDidMount() {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
    }

    this.props.navigation.setParams({
      onCancelEditing: this.onCancelEditing,
      onNavigationButtonPressed: this.onNavigationButtonPressed,
      onGlobalSelectionToggled: this.onGlobalSelectionToggled,
    })
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
    }
  }
  
  // Rendering.
  
  render() {
    const {
      content,
      refreshing,
      onRefresh,
      canAdd,
      addOptions,
      queueSize,
      position,
      canEdit,
      canDelete,
      canRearrange,
      deletePrompt,
    } = this.props
    
    const { selected, editing, showingDeleteDialog } = this.state

    const items = content.map((item, index) => {
      return {
        name: item.name, 
        type: item.type, 
        artist: item.artist,
        albumArtist: item.albumArtist,
        title: item.title, 
        path: item.fullPath,
        id: item.id,
        index: index,
        subtitle: item.subtitle,
        selected: selected.find(it => { return it.index == index }) != null,
        status: item.status,
      } 
    })

    const { showingMenu } = this.state

    // Populating options.
    let options = [OPTIONS.ADD_TO_QUEUE_BEGINNING]

    // If there's a current song, we can use at as an anchor.
    if (position !== null) {
        options.push(OPTIONS.ADD_TO_QUEUE_AFTER_CURRENT_SONG)
    }

    // If queue is not empty, we can add at the and as well as the beginning.
    if (queueSize > 0) {
        options.push(OPTIONS.ADD_TO_QUEUE_END)
    }

    // Add to playlist option.
    options.push(OPTIONS.ADD_TO_PLAYLIST)

    // Filter with supported options from props.
    options = options.filter(opt => {
      return addOptions.find(addOpt => {
        return addOpt.value == opt.value
      }) != null
    })

    let deleteText = null
    if (deletePrompt != null) {
      if (selected.length > 1) {
        deleteText = deletePrompt.multiple.replace('%%', selected.length)
      } else {
        deleteText = deletePrompt.single
      }
    } 

    return (
      <View style={{flex: 1}}>
        <UniversalList
          content={items}
          editing={editing}
          refreshing={refreshing}
          onRefresh={onRefresh}

          canAdd={canAdd}
          canDelete={canDelete}
          canRearrange={canRearrange}
          canEdit={canEdit}

          onItemTapped={this.handleItemTapped}
          onItemMenu={this.handleMenuTapped} 
          onItemLongTapped={this.handleItemLongTapped}
          onItemMoved={this.handleItemMoved}
          onItemDelete={this.handleItemDelete}

          extraData={{editing, selected}}
        />
        {showingMenu && (
          <MenuDialog
            title='Add items...'
            options={options}
            onHide={this.handleBackPress}
            onOptionSelected={this.onOptionSelected}
          />
        )}
        {showingDeleteDialog && (
          <AppDialog
            prompt={deleteText}
            cancelButton={{ title: 'Cancel', onPress: this.handleDeleteCancel }}
            confirmButton={{ title: 'Delete', onPress: this.handleDeleteConfirm }}
          />
        )}
      </View>
    )
  }

  // Events.
  
  handleItemTapped = (item) => {
    const { addToQueuePlay, queueSize, onNavigate, navigation, content, onSelection } = this.props
    const { editing, selected } = this.state

    if (editing) {
      let newSelected = selected.slice()

      if (selected.find(({ name }) => { return name === item.name }) != null) {
        newSelected = selected.filter(({ name }) => { return name != item.name })
        if (newSelected.length == 0) {
          this.onCancelEditing()
        } else {
          // First update own state.
          this.setState({
            selected: newSelected,
          })

          // Update navigation bar state.
          navigation.setParams({
            allSelected: newSelected.length === content.length
          })
        }
      } else {
        newSelected.push(item)

        // First update own state.
        this.setState({
          selected: newSelected,
        })

        // Update navigation bar state.
        navigation.setParams({
          allSelected: newSelected.length === content.length
        })
      }
    } else {
      if (onSelection != null) {
        onSelection(item)
      } else if (item.type === 'FILE') {
        addToQueuePlay(item.path, queueSize)
      } else {
        onNavigate(item)
      }
    }
  }

  handleItemLongTapped = (item) => {
    const { navigation, content } = this.props

    // Setup transition to editing state.
    LayoutAnimation.configureNext(MainLayoutAnimation)

    // Add item to selected list.
    let newSelected = this.state.selected.slice()
    newSelected.push(item)
    
    // Update own state.
    this.setState({
      editing: true,
      selected: newSelected,
    })

    // Update navigation bar state.
    navigation.setParams({
      editing: true,
      allSelected: newSelected.length === content.length
    })
  }

  handleMenuTapped = (item) => {
    const { editing, selected } = this.state

    // When in editing mode, ignore menu presses.
    if (editing) {
      return
    }

    let newSelected = selected.slice()
    newSelected.push(item)

    LayoutAnimation.configureNext(MainLayoutAnimation)
    this.setState({
      showingMenu: true,
      selected: newSelected,
    })
  }

  onOptionSelected = (opt) => {
    const { addToQueue, content, queueSize, position = null } = this.props

    const sorted = this.state.selected.slice()
    sorted.sort((one, two) => {
      return (one.index < two.index ? -1 : 1)
    })

    const paths = sorted.map(item => {
      return content[item.index]
    })

    let hideMenu = true

    switch (opt.value) {
      case OPTIONS.ADD_TO_QUEUE_BEGINNING.value:
        addToQueue(paths, 0)
        break
      case OPTIONS.ADD_TO_QUEUE_END.value:
        addToQueue(paths, queueSize)
        break
      case OPTIONS.ADD_TO_QUEUE_AFTER_CURRENT_SONG.value:
        addToQueue(paths, position + 1)
        break
      case OPTIONS.ADD_TO_PLAYLIST.value: {
        this.navigateToPlaylists(paths)
        hideMenu = false
        break
      }
    }

    if (!hideMenu) {
      return
    }

    LayoutAnimation.configureNext(MainLayoutAnimation, this.onCancelEditing)
    this.setState({
      editing: false,
      showingMenu: false,
      selected: [],
    })
    this.props.navigation.setParams({ editing: false })
  }

  handleBackPress = () => {
    const { showingMenu, selected, editing } = this.state

    if (showingMenu) {
      let newSelected = selected

      if (!editing) {
        newSelected = []
      }

      LayoutAnimation.configureNext(MainLayoutAnimation)
      this.setState({
        showingMenu: false,
        selected: newSelected,
      })

      return true
    }

    if (editing) {
      this.onCancelEditing()
      return true
    }

    return false
  }

  // Navigation menu.

  onCancelEditing = () => {
    const { navigation } = this.props
    navigation.setParams({ editing: false })

    const { selected } = this.state

    LayoutAnimation.configureNext(MainLayoutAnimation)
    this.setState({
      selected: [],
      editing: false,
    })
  }

  onNavigationButtonPressed = (icon) => {
    switch (icon) {
      case 'playlist-add':
        this.onConfirmAdd()
        break
      case 'delete':
        this.onConfirmDelete()
        break
    }
  }

  onConfirmAdd = () => {
    const { selected } = this.state
    
    if (selected.length == 0) {
      return
    }

    LayoutAnimation.configureNext(MainLayoutAnimation)
    this.setState({
      showingMenu: true,
    })
  }

  onConfirmDelete = () => {
    const { selected } = this.state

    if (selected.length == 0) {
      return
    }

    this.onHandleDelete()
  }

  onGlobalSelectionToggled = (all) => {
    const { navigation, content } = this.props

    if (all) {
      const items = content.map((item, index) => {
        return {
          name: item.name,
          index: index,
        }
      })

      this.setState({
        selected: items,
      })

      // Update navigation bar state.
      navigation.setParams({
        allSelected: true,
      })
    } else {
      this.setState({
        selected: [],
      })

      // Update navigation bar state.
      navigation.setParams({
        allSelected: false,
      })
    }
  }

  // Deletion.
  
  onHandleDelete = () => {
    const { confirmDelete, onDeleteItems } = this.props
    const { selected } = this.state

    if (selected.length == 0) {
      return
    }
    
    if (!confirmDelete) {
      this.handleDeleteConfirm()
      return
    }

    LayoutAnimation.configureNext(MainLayoutAnimation)
    this.setState({
      showingDeleteDialog: true,
    })
  }

  handleDeleteCancel = () => {
    LayoutAnimation.configureNext(MainLayoutAnimation)
    this.setState({
      showingDeleteDialog: false,
    })
  }

  handleDeleteConfirm = () => {
    const { selected } = this.state
    const { navigation, onDeleteItems } = this.props

    // Reset editing state.
    LayoutAnimation.configureNext(MainLayoutAnimation)
    this.setState({
      editing: false,
      selected: [],
      showingDeleteDialog: false,
    })

    navigation.setParams({
      editing: false
    })

    // Call the delete callback.
    onDeleteItems(selected)
  }

  handleItemDelete = (item) => {
    const { onDeleteItems } = this.props

    onDeleteItems([item])
  }

  // Playlist selection.

  navigateToPlaylists = (paths) => {
    const { addToPlaylist, navigation } = this.props

    const action = NavigationActions.navigate({
      params: {
        callback: (name) => this.addToPlaylist(name, paths)
      },
      routeName: 'Playlists',
      key: 'selectPlaylist',
    })
    navigation.dispatch(action)
  }

  addToPlaylist = (name, paths) => {
    const { navigation, addToPlaylist } = this.props

    // Pop the stack.
    const popAction = StackActions.pop({ n: 1 })
    navigation.dispatch(popAction)

    // Close the menu.
    LayoutAnimation.configureNext(MainLayoutAnimation, this.onCancelEditing)
    this.setState({
      editing: false,
      showingMenu: false,
      selected: [],
    })
    this.props.navigation.setParams({ editing: false })

    // Perform an action.
    addToPlaylist(name, paths)
  }

  // Moving.
  
  handleItemMoved = (data) => {
    this.props.onItemMoved(data)
  }
}

// Redux setup.

const mapDispatchToProps = dispatch => {
  return {
    addToQueue: (uri, position, type) => {
      dispatch(addToQueue(uri, position, type))
    },
    addToQueuePlay: (uri, position) => {
      dispatch(addToQueuePlay(uri, position))
    },
    addToPlaylist: (name, paths) => {
      dispatch(addToPlaylist(name, paths))
    },
  }
}

export default connect(null, mapDispatchToProps)(Browsable)
