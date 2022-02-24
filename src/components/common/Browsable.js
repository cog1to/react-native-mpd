import React from 'react'

import {
  View,
  StyleSheet,
  Text,
  Platform,
  BackHandler,
  LayoutAnimation,
  UIManager,
  TextInput
} from 'react-native'

// Device info.
import DeviceInfo from 'react-native-device-info'

// Navigation.
import { CommonActions, StackActions } from '@react-navigation/native'

// Prop Types.
import PropTypes from 'prop-types'

// List.
import UniversalList from './UniversalList'

// Menu dialog.
import MenuDialog from './MenuDialog'

// Delete dialog.
import AppDialog from './AppDialog'

// Bar button
import BarButton from './BarButton'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { addToQueue, addToQueuePlay } from '../../redux/reducers/browser/actions'
import { addToPlaylist } from '../../redux/reducers/playlists/actions'

// Keyboard state listener.
import KeyboardState from './KeyboardState'

// Themes.
import ThemeManager from '../../themes/ThemeManager'

// Lodash for debounce method.
import _ from 'lodash'

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

class KeyboardAwareBrowsable extends React.Component {
  state = {
    layout: null,
  }

  static propTypes = {
    // From `KeyboardState`
    keyboardHeight: PropTypes.number.isRequired,
    keyboardVisible: PropTypes.bool.isRequired,
    keyboardWillShow: PropTypes.bool.isRequired,
    keyboardWillHide: PropTypes.bool.isRequired,
    keyboardAnimationDuration: PropTypes.number.isRequired,
    screenY: PropTypes.number.isRequired,

    // Rendering content
    children: PropTypes.node,
  }

  static defaultProps = {
    children: null,
  }

  handleLayout = event => {
    const { nativeEvent: { layout } } = event

    if (this.state.layout == null) {
      this.setState({
        layout,
      })
    }
  }

  render() {
    const { layout } = this.state

    const {
      children,
      keyboardHeight,
      keyboardVisible,
      keyboardAnimationDuration,
      keyboardWillShow,
      keyboardWillHide,
      screenY,
    } = this.props

    let hasSafeArea = function() {
      let device = DeviceInfo.getDeviceId()
      if (device.startsWith("iPhone")) {
        let model = parseInt(device.split(',')[0].substring("iPhone".length))
        if (model >= 11) {
          return true
        }
      }
      return false
    }()

    const containerStyle = (layout != null)
      ? (Platform.OS === 'ios'
        ? { height: keyboardVisible ? (screenY - layout.y - (hasSafeArea ? 88 : 64)) : layout.height, width: '100%' }
        : { height: keyboardVisible ? (screenY - layout.y - 80) : layout.height, width: '100%' })
      : { height: '100%', width: '100%' }

    return (
      <View style={containerStyle} onLayout={this.handleLayout}>
        {children}
      </View>
    )
  }
}

class Browsable extends React.Component {
  onSearchChange = (text) => {
    this.setState({
      search: text
    })
  }

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
    canFilter: PropTypes.bool.isRequired,
    canSelectMode: PropTypes.bool.isRequired,
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
    mode: PropTypes.string,
  }

  state = {
    selected: [],
    editing: false,
    showingMenu: false,
    showingDeleteDialog: false,
    refreshing: false,
    position: null,
    searching: false,
    search: null,
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
    canFilter: false,
    canSelectMode: false,
    deletePrompt: null,
    onItemMoved: null,
    confirmDelete: true,
    onRefresh: null,
    refreshing: null,
    mode: 'list'
  }

  // Global handlers.

  componentDidMount() {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
    }

    this.updateNavigationBar(false)
  }

  componentDidUpdate(prevProps, prevState) {
    this.updateNavigationBar(this.state.searching ?? false)
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
      mode,
      theme
    } = this.props

    const { selected, editing, showingDeleteDialog, search } = this.state

    const themeValue = ThemeManager.instance().getTheme(theme)

    // Filter based on search field input.
    let filtered = content
    if (search != null) {
      let searchString = search.toLowerCase()
      filtered = content.filter((item) => { return item.name.toLowerCase().includes(searchString) })
    }

    const items = filtered.map((item, index) => {
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
      <KeyboardState>
        {keyboardInfo => (
          <KeyboardAwareBrowsable {...keyboardInfo}>
            <View style={{flex: 1, backgroundColor: themeValue.backgroundColor}}>
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
                mode={mode}
                theme={theme}
              />
              {showingMenu && (
                <MenuDialog
                  title='Add items...'
                  options={options}
                  onHide={this.handleBackPress}
                  onOptionSelected={this.onOptionSelected}
                  theme={theme}
                />
              )}
              {showingDeleteDialog && (
                <AppDialog
                  prompt={deleteText}
                  cancelButton={{ title: 'Cancel', onPress: this.handleDeleteCancel }}
                  confirmButton={{ title: 'Delete', onPress: this.handleDeleteConfirm }}
                  theme={theme}
                />
              )}
            </View>
          </KeyboardAwareBrowsable>
        )}
      </KeyboardState>
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
    const { selected, search } = this.state

    navigation.setParams({ editing: false, searchText: search })

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
      case 'filter-list':
        this.onSearch()
        break
      default:
        this.props.onIconTapped != null && this.props.onIconTapped(icon)
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
          id: item.id,
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

    const action = CommonActions.navigate({
      name: 'Playlists',
      key: 'selectPlaylist',
      params: {
        callback: (name) => this.addToPlaylist(name, paths)
      }
    })
    navigation.dispatch(action)
  }

  addToPlaylist = (name, paths) => {
    const { navigation, addToPlaylist } = this.props

    // Pop the stack.
    const popAction = StackActions.pop(1)
    navigation.dispatch(popAction)

    // Close the menu.
    LayoutAnimation.configureNext(MainLayoutAnimation, this.onCancelEditing)
    this.setState({
      editing: false,
      showingMenu: false,
      selected: [],
    })
    //this.props.navigation.setParams({ editing: false })

    // Perform an action.
    addToPlaylist(name, paths)
  }

  // Moving.

  handleItemMoved = (data) => {
    this.props.onItemMoved(data)
  }

  // Filter.

  onSearch = () => {
    const { navigation, theme } = this.props
    const themeValue = ThemeManager.instance().getTheme(theme)

    LayoutAnimation.configureNext(MainLayoutAnimation)
    this.setState({searching: true})
    this.updateNavigationBar(true)
  }

  onCancelSearch = () => {
    const { navigation, canFilter, theme } = this.props
    const themeValue = ThemeManager.instance().getTheme(theme)

    this.setState({
      search: null,
    })

    LayoutAnimation.configureNext(MainLayoutAnimation)
    this.setState({searching: false})
    this.updateNavigationBar(false)
  }

  updateNavigationBar = (searchEnabled) => {
    const { theme, canFilter, navigation, canSelectMode, mode, onIconTapped } = this.props
    const themeValue = ThemeManager.instance().getTheme(theme)
    const icon = mode == 'list' ? 'view-module' : 'view-list'

    if (searchEnabled == true) {
      navigation.setOptions({
        headerTitle: () => {
          return (
            <View style={styles.searchBarHeader}>
              <View style={{...styles.searchBarBackground, backgroundColor: themeValue.backgroundColor}}>
                <TextInput
                  value={navigation.params?.searchText}
                  style={{...styles.searchBarTextInput, color: themeValue.mainTextColor}} placeholder='Filter list...'
                  placeholderTextColor={themeValue.placeholderColor}
                  onChangeText={this.onSearchChange}
                />
              </View>
            </View>
          )
        },
        headerRight: () => {
          return (<BarButton onPress={this.onCancelSearch} icon='clear' theme={themeValue} padding={0} />)
        }
      })
    } else {
      navigation.setOptions({
        headerRight: () => { 
          return (
            <View style={styles.rightEditingHeader}>
              {canSelectMode ? <BarButton onPress={() => onIconTapped(icon)} icon={icon} theme={themeValue} style={{paddingRight: 12}} /> : null}
              {canFilter ? <BarButton onPress={this.onSearch} icon='filter-list' theme={themeValue} /> : null}
            </View>
          )
        },
        headerTitle: null
      })
    }
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

const styles = StyleSheet.create({
  searchBarBackground: {
    backgroundColor: 'white',
    left: Platform.OS === 'android' ? 0 : 4,
    right: Platform.OS === 'android' ? 0 : 4,
    borderRadius: 8,
    height: 30,
    width: '85%'
  },
  searchBarTextInput: {
    flex: 1,
    marginHorizontal: Platform.OS === 'android' ? 4 : 12,
  },
  searchBarHeader: {
    marginHorizontal: 8,
    flex: 1,
  },
  rightEditingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})