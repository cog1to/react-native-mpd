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
      <Image
        source={path != null ? { uri: path } : require('../../../assets/images/unknown-album-art-borderless.png')}
        style={styles.cover}
        resizeMode='cover'
      />
    )
  }
}

const styles = StyleSheet.create({
  cover: {
    maxWidth: '100%',
    aspectRatio: 1,
    backgroundColor: ThemeManager.instance().getCurrentTheme().tableBackgroundColor,
  },
})
