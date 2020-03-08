import React from 'react'
import {
  View,
  StyleSheet,
  Platform,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native'
import PropTypes from 'prop-types'

// Subviews.
import Highlightable from './Highlightable'

// Shadow style that works on both iOS and Android.
import { elevationShadowStyle } from '../../utils/Styles'

// Themes.
import ThemeManager from '../../themes/ThemeManager'

// Icons.
import Icon from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { getArtistArt } from '../../redux/reducers/artists/actions'
import { getAlbumArt } from '../../redux/reducers/archive/actions'

class ListTileItem extends React.Component {
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

    const width = Dimensions.get('window').width / 2.0 - 12.0
    const padding = styles.wrapper.padding
    const shadowPadding = 2.0
    const imageWidth = width - shadowPadding - (padding * 2.0)
    const imageHeight = (height / 2.0) - (shadowPadding / 2.0) + 18 

    const { move, moveEnd, onLongTap = null } = this.props

    let statusStyle = (draggable && !editing)
      ? styles.statusWithDraggable
      : styles.status

    let realSubtitle = subtitle
    let icon = null
    switch (type) {
      case 'ARTIST':
        if (url != null) {
          icon = <Image 
            source={{ uri: url }}
            style={{ height: imageHeight, width: imageWidth }}
            resizeMode='cover'
            cache='default'
          />
        } else {
          icon = <Icon
            name='person'
            style={{fontSize: 70, height: imageHeight}}
            color={ThemeManager.instance().getCurrentTheme().backgroundColor}
          />
        }
        break
      case 'ALBUM':
        realSubtitle = 'ALBUM'
        if (url != null) {
          icon = <Image 
            source={{ uri: url }}
            style={{ height: imageHeight, width: imageWidth}}
            resizeMode='cover'
            cache='default'
          />
        } else {
          icon = <Icon
            name='album'
            style={{fontSize: 70, height: imageHeight}}
            color={ThemeManager.instance().getCurrentTheme().backgroundColor}
          />
        }
        break
    }

    let iconColor = status != 'none'
      ? activeColor
      : passiveColor

    return (
      <View style={{...styles.wrapper, height: height, width: width}}>
        <Highlightable
          underlayColor={highlightColor}
          foregroundColor='#FFFFFF'
          duration={250}
          onPress={this.handlePress}
          onLongPress={onLongTap}
          key={'' + id}
          highlighted={selected}
        >
          <View style={{...styles.itemContainer, height: height - padding * 2, width: width - padding * 2}}>
            <View style={{...styles.image, width: imageWidth, height: imageHeight}}>
              {icon}
            </View>
            <View style={styles.details}>
              <View style={styles.description}>
                <Text style={styles.title} numberOfLines={1} ellipsizeMode='tail'>{title}</Text>
              </View>
              <TouchableOpacity
                onPress={this.handleMenuPress}
                disabled={editing}
              >
                {!editing && canAddItems && (
                  <Icon name='more-vert' color='black' style={styles.status} />
                )}
                {editing && selected && (
                  <Icon name='check' color='black' style={styles.status} />
                )}
                {editing && !selected && 
                  // Placeholder view to keep the text layout the same.
                  (<View style={styles.placeholder} />)
                }
              </TouchableOpacity>
            </View>
          </View>
        </Highlightable>
      </View>
    )
  }

  handleMenuPress = () => {
    this.props.onMenu()
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
      return { url: artists[title]['large'] }
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

export default connect(mapStateToProps, mapDispatchToProps)(ListTileItem)

const styles = StyleSheet.create({
  wrapper: {
    padding: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  itemContainer: {
    ...elevationShadowStyle(1),
    borderRadius: 1,
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
  },
  image: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    backgroundColor: ThemeManager.instance().getCurrentTheme().tableBackgroundColor,
  },
  details: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 1,
  },
  description: {
    alignItems: 'stretch',
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
  },
  title: {
    flexGrow: 1,
    flexShrink: 1,
    fontWeight: 'bold',
    color: ThemeManager.instance().getCurrentTheme().mainTextColor,
    fontSize: ThemeManager.instance().getCurrentTheme().subTextSize,
  },
  subtitle: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: ThemeManager.instance().getCurrentTheme().subTextSize,
  },
  status: {
    fontSize: 20,
  },
  placeholder: {
    width: 60,
    height: '100%',
  },
})

