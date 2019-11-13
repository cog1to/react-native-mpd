import React from 'react'
import {
  View,
  StyleSheet,
  Platform,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native'
import PropTypes from 'prop-types'

// Sub-components.
import Highlightable from './Highlightable'
import Swipeable from './Swipeable'

// Icons.
import Icon from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { getArtistArt } from '../../redux/reducers/artists/actions'
import { getAlbumArt } from '../../redux/reducers/archive/actions'

class ListItem extends React.Component {
  static propTypes = {
    // Data.
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    id: PropTypes.string,
    type: PropTypes.string.isRequired,
    selected: PropTypes.bool.isRequired,
    editing: PropTypes.bool.isRequired,
    status: PropTypes.string.isRequired,
    context: PropTypes.string,

    // From store.
    url: PropTypes.string,
    
    // Capabilities.
    draggable: PropTypes.bool.isRequired,
    canAddItems: PropTypes.bool.isRequired,
    canDelete: PropTypes.bool.isRequired,
    
    // Callbacks.
    onDelete: PropTypes.func,
    onTap: PropTypes.func,
    onLongTap: PropTypes.func,
    
    // Style.
    activeColor: PropTypes.string.isRequired,
    passiveColor: PropTypes.string.isRequired,
    highlightColor: PropTypes.string.isRequired,
    underlayColor: PropTypes.string.isRequired,

    // Dragging.
    move: PropTypes.func,
    moveEnd: PropTypes.func,
  }

  componentDidMount() {
    const { url, getArtistArt, getAlbumArt, type, title, subtitle, artist = null } = this.props

    if (url != null) {
      return
    }

    if (type == 'ARTIST' && title.length > 0 && title != 'VA') {
      getArtistArt(title)
    } else if (type == 'ALBUM') { 
      if (title.length > 0 && artist != null && artist.length > 0) {
        getAlbumArt(artist, title)
      }
    }
  }

  shouldComponentUpdate(nextProps) {
    const {
      title: nextTitle,
      status: nextPlaying,
      editing: nextEditing,
      selected: nextSelected,
      subtitle: nextSubtitle,
      id: nextId = null,
      index: nextIndex,
      url: nextUrl,
    } = nextProps
        
    const {
      title,
      status,
      editing,
      selected,
      subtitle,
      id = null,
      index,
      url = null,
    } = this.props

    return title != nextTitle
      || status != nextPlaying
      || editing != nextEditing
      || selected != nextSelected
      || subtitle != nextSubtitle
      || id != nextId
      || index != nextIndex
      || url != nextUrl
  }

  render() {
    const {
      editing,
      draggable,
      title,
      subtitle,
      id,
      selected,
      activeColor,
      passiveColor,
      highlightColor,
      underlayColor,
      type,
      status,
      canAddItems,
      canDelete,
      height,
      url,
    } = this.props

    const { move, moveEnd, onLongTap = null } = this.props

    let statusStyle = (draggable && !editing)
      ? styles.statusWithDraggable
      : styles.status

    let realSubtitle = subtitle
    let icon = null
    switch (type) {
      case 'FILE':
        if (status == 'play') {
          icon = <FontAwesome name='play' size={20} style={statusStyle} color={activeColor} />
        } else if (status == 'pause') {
          icon = <FontAwesome name='pause' size={20} style={statusStyle} color={activeColor} />
        } else if (id != null) {
          icon = <Text style={statusStyle}>{"" + id}</Text>
        } else {
          icon = <FontAwesome name='music' size={22} style={statusStyle} color={passiveColor} />
        }
        break
      case 'DIRECTORY':
        icon = <Icon name='folder' style={{...statusStyle, fontSize:20}} color={passiveColor} />
        break
      case 'PLAYLIST':
        icon = <FontAwesome name='file' style={{...statusStyle, fontSize:18}} color={passiveColor} />
        break
      case 'ARTIST':
        if (url != null) {
          icon = <Image 
            source={{ uri: url, cache: 'only-if-cached' }}
            style={{ width: 36, height: 36, borderRadius: 18 }}
            resizeMode='cover'
          />
        } else {
          icon = <Icon name='person' style={{...statusStyle, fontSize:20}} color={passiveColor} />
        }
        break
      case 'ALBUM':
        realSubtitle = 'ALBUM'
        if (url != null) {
          icon = <Image 
            source={{ uri: url, cache: 'only-if-cached' }}
            style={{ width: 36, height: 36, borderRadius: 18 }}
            resizeMode='cover'
          />
        } else {
          icon = <Icon name='album' style={{...statusStyle, fontSize:20}} color={passiveColor} />
        }
        break
    }

    let iconColor = status != 'none' 
      ? activeColor
      : passiveColor

    let titleStyle = status != 'none'
      ? styles.titlePlaying
      : styles.title

    return (
      <Swipeable
        enabled={canDelete}
        icon='delete'
        underlayColor={underlayColor}
        onSwipe={this.handleSwipe}
        id={title}
      >
        <Highlightable
          underlayColor={highlightColor}
          foregroundColor='#FFFFFF'
          duration={250}
          onPress={this.handlePress}
          onLongPress={onLongTap}
          key={'' + id}
          style={styles.container}
          highlighted={selected}
        >
          <View style={{...styles.itemContainer, height: height}}>
            {!editing && draggable && (
              <TouchableOpacity
                onLongPress={this.handleMove}
                onPressOut={moveEnd}
              >
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name='drag-handle' color={passiveColor} style={{...styles.status, fontSize: 24}} />
                </View>
              </TouchableOpacity>
 
            )}
            <View style={{ alignItems: 'center', justifyContent: 'center', width: (!editing && draggable ? 30 : 60) }}>
              {icon}
            </View>
            <View style={styles.description}>
              <Text style={titleStyle} numberOfLines={1} ellipsizeMode='tail'>{title}</Text>
              <Text style={styles.subtitle}>{realSubtitle}</Text>
            </View>
            <TouchableOpacity
              onPress={this.handleMenuPress}
              disabled={editing}
            >
              {!editing && canAddItems && (
                <Icon name='more-vert' color='black' style={{...styles.status, fontSize: 20}} />
              )}
              {editing && selected && (
                <Icon name='check' color='black' style={{...styles.status, fontSize: 20}} />
              )}
              {editing && !selected && 
                // Placeholder view to keep the text layout the same.
                (<View style={{width: 60, height: '100%'}} />)
              }
            </TouchableOpacity>
          </View>
        </Highlightable>
      </Swipeable>
    )
  }

  // Events.
  
  handleMove = () => {
    this.props.move()
  }

  handleMenuPress = () => {
    this.props.onMenu()
  }

  handleSwipe = () => {
    this.props.onDelete()
  }

  handlePress = () => {
    this.props.onTap()
  }
}

const mapStateToProps = (state, ownProps) => {
  const { type, title, artist = null } = ownProps
  const { artists, archive } = state

  if (type == 'ARTIST' && title.length > 0 && title != 'VA') {
    if (title in artists && artists[title] != null) {
      return { url: artists[title]['small'] }
    }
  } else if (type == 'ALBUM' && title.length > 0 && artist != null && artist.length > 0) {
    if (artist in archive && title in archive[artist]) {
      return { url: archive[artist][title] }
    }
  }

  return {}
}

const mapDispatchToProps = (dispatch) => ({
  getArtistArt: (artist) => { dispatch(getArtistArt(artist)) },
  getAlbumArt: (artist, album) => { dispatch(getAlbumArt(artist, album)) },
})

export default connect(mapStateToProps, mapDispatchToProps)(ListItem)

styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  status: {
    width: 60,
    textAlign: 'center',
    alignSelf: 'stretch',
    textAlignVertical: 'center',
    fontSize: 12,
  },
  statusWithDraggable: {
    width: 30,
    textAlign: 'left',
    alignSelf: 'stretch',
    textAlignVertical: 'center',
    fontSize: 12,
  },
  description: {
    flex: 1,
    flexDirection: 'column',
    marginRight: 10,
  },
  title: {
    fontWeight: Platform.OS === 'android' ? 'normal' : '500',
    fontSize: 16,
    color: 'black',
    marginBottom: Platform.OS === 'android' ? 0 : 2,
  },
  titlePlaying: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
    marginBottom: Platform.OS === 'android' ? 0 : 2,
  },
  subtitle: {
    fontSize: 13,
    color: 'gray',
  },
  menuWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
