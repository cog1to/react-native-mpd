import React from 'react'
import PropTypes from 'prop-types'
import {
  View,
  StyleSheet,
  Image,
} from 'react-native'

import ThemeManager from '../../themes/ThemeManager'

export default class CoverItem extends React.Component {
  static propTypes = {
    path: PropTypes.string
  }

  static defaultProps = {
    path: null
  }

  render() {
    const { path } = this.props

    return (
      <View style={styles.cover}>
        <Image
          source={path != null ? { uri: path } : require('../../../assets/images/unknown-album-art-borderless.png')}
          style={{ width: '100%', aspectRatio: 1 }}
          resizeMode='cover'
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  cover: {
    width: '100%',
    maxWidth: '100%',
    aspectRatio: 1,
    backgroundColor: ThemeManager.instance().getCurrentTheme().tableBackgroundColor,
  },
  image: {
    width: '100%'
  }
})
