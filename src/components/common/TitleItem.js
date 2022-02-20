import React from 'react'
import PropTypes from 'prop-types'
import {
  View,
  StyleSheet,
  Image,
  Text,
  Platform,
} from 'react-native'

import ThemeManager from '../../themes/ThemeManager'

// Icons.
import Icon from 'react-native-vector-icons/MaterialIcons'

export default class TitleItem extends React.Component {
  static propTypes = {
    path: PropTypes.string
  }

  static defaultProps = {
    path: null
  }

  render() {
    const { url, title, artist, subtitle, theme } = this.props

    const themeValue = ThemeManager.instance().getTheme(theme)
    const textColor = themeValue.mainTextColor
    const subColor = themeValue.lightTextColor
    const reversedIconColor = themeValue.reversedIconColor

    let icon = null
    if (url != null) {
      icon = <Image 
        source={{ uri: url }}
        style={{ width: 36, height: 36, borderRadius: 18 }}
        resizeMode='cover'
      />
    } else {
      icon = <View style={styles.iconContainer}><Icon
        name='person'
        style={styles.status}
        color={reversedIconColor}
      /></View>
    }

    return (
      <View style={styles.container}>
        <Text style={{...styles.title, color: textColor}}>{title}</Text>
        <View style={styles.secondaryContainer}>
          <View style={styles.imageContainer}>
            {icon}
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={{...styles.main, color: textColor}}>{artist}</Text>
            <Text style={{...styles.sub, color: subColor}}>{subtitle}</Text>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingVertical: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: ThemeManager.instance().getCurrentTheme().titleTextSize,
    fontWeight: 'bold',
  },
  secondaryContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flex: 1,
  },
  image: {
    height: 36,
    width: 36,
    borderRadius: 18,
  },
  descriptionContainer: {
    flexDirection: 'column',
  },
  main: {
    fontWeight: Platform.OS === 'android' ? 'normal' : '500',
    fontSize: ThemeManager.instance().getCurrentTheme.mainTextSize,
    color: ThemeManager.instance().getCurrentTheme().mainTextColor,
    marginBottom: Platform.OS === 'android' ? 0 : 2,
  },
  sub: {
    fontSize: ThemeManager.instance().getCurrentTheme.subTextSize,
    color: ThemeManager.instance().getCurrentTheme().lightTextColor,
  },
  imageContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: 48
  },
  iconContainer: {
    flexDirection:'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 36,
    height: 36, 
    backgroundColor: ThemeManager.instance().getCurrentTheme().tableBackgroundColor,
    borderRadius: 18,
  },
  status: {
    textAlign: 'center',
    alignSelf: 'stretch',
    textAlignVertical: 'center',
    fontSize: 20,
  },
})
