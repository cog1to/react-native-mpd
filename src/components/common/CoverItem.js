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
    path: PropTypes.string,
    theme: PropTypes.string.isRequired
  }

  static defaultProps = {
    path: null
  }

  state = {
    failed: false,
  }

  render() {
    const { path, theme } = this.props
    const { failed } = this.state

    const backgroundColor = ThemeManager.instance().getTheme(theme).tableBackgroundColor

    return (
      <View style={{...styles.cover, backgroundColor: backgroundColor}}>
        <Image
          source={failed == false && path != null ? { uri: path } : require('../../../assets/images/unknown-album-art-borderless.png')}
          resizeMode='cover'
          onError={this.onError}
          style={styles.image}
        />
      </View>
    )
  }

  onError = () => {
    this.setState({
      failed: true,
    })
  }
}

const styles = StyleSheet.create({
  cover: {
    width: '100%',
    maxWidth: '100%',
    aspectRatio: 1
  },
  image: {
    width: '100%',
    height: '100%'
  }
})
