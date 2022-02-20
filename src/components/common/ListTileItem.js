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
import { elevationShadowStyle, elevationShadowStyleWithColor } from '../../utils/Styles'

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
    theme: PropTypes.string.isRequired
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
      theme: nextTheme
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
      theme
    } = this.props

    return title != nextTitle
      || status != nextPlaying
      || editing != nextEditing
      || selected != nextSelected
      || subtitle != nextSubtitle
      || id != nextId
      || index != nextIndex
      || url != nextUrl
      || theme != nextTheme
  }

  render() {
    const {
      editing,
      draggable,
      title,
      subtitle,
      id,
      selected,
      type,
      status,
      canAddItems,
      canDelete,
      height,
      width,
      url,
      numColumns,
      theme
    } = this.props

    const padding = styles.wrapper.padding
    const shadowPadding = 2.0
    const imageWidth = width - shadowPadding - (padding * 2.0)
    const imageHeight = (height / 2.0) - (shadowPadding / 2.0) + 18 

    const { onLongTap = null } = this.props

    const themeValue = ThemeManager.instance().getTheme(theme)
    const textColor = themeValue.mainTextColor
    const activeColor = themeValue.activeColor
    const passiveColor = themeValue.lightTextColor
    const highlightColor= themeValue.highlightColor
    const underlayColor = themeValue.accentBackgroundColor
    const backgroundColor = themeValue.backgroundColor

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
            color={themeValue.backgroundColor}
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
            color={themeValue.backgroundColor}
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
          foregroundColor={backgroundColor}
          duration={250}
          onPress={this.handlePress}
          onLongPress={onLongTap}
          key={'' + id}
          highlighted={selected}
        >
          <View style={{...styles.itemContainer, ...elevationShadowStyleWithColor(1, themeValue.mainTextColor), height: height - padding * 2, width: width - padding * 2, backgroundColor: backgroundColor}}>
            <View style={{...styles.image, width: imageWidth, height: imageHeight, backgroundColor: themeValue.tableBackgroundColor}}>
              {icon}
            </View>
            <View style={styles.details}>
              <View style={styles.description}>
                <Text style={{...styles.title, color: textColor}} numberOfLines={1} ellipsizeMode='tail'>{title}</Text>
              </View>
              <TouchableOpacity
                onPress={this.handleMenuPress}
                disabled={editing}
              >
                {!editing && canAddItems && (
                  <Icon name='more-vert' color={textColor} style={styles.status} />
                )}
                {editing && selected && (
                  <Icon name='check' color={textColor} style={styles.status} />
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
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
  },
  image: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
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

