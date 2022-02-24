import React from 'react'
import {
  View,
  StyleSheet,
  Button,
  Text,
  Image,
  UIManager,
  Animated,
  Platform,
  TouchableOpacity
} from 'react-native'
import _ from 'lodash'

// Icons.
import Icon from 'react-native-vector-icons/MaterialIcons'

// Redux.
import { connect } from 'react-redux'

// Sub-controls.
import SongProgress from '../components/SongProgress'
import Controls from '../components/Controls'
import AlbumArt from '../components/AlbumArt'
import CurrentSong from '../components/CurrentSong'
import VolumeControl, { VolumeBarHeight } from '../components/VolumeControl'
import BarButton from '../components/common/BarButton'

// Player actions.
import { setVolume } from '../redux/reducers/player/actions'

// Themes.
import ThemeManager from '../themes/ThemeManager'

// Enable animations on Android.
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

class Player extends React.Component {
  constructor(props) {
    super(props)

    this.handleVolumeChangeThrottled = _.throttle(this.handleVolumeChange, 200)

    // Contains last invoked animation.
    this.lastAnimation = null

    // Current animation type.
    this.slidingIn = false
  }

  state = {
    volumeSliderOffset: new Animated.Value(0),
  }

  componentDidMount() {
    const { navigation, theme } = this.props
    const themeValue = ThemeManager.instance().getTheme(theme)

    navigation.setOptions({
      headerRight: () => {
        return (<BarButton onPress={this.onVolumeToggle} icon='volume-down' theme={themeValue} padding={0} />)
      }
    })
  }

  onVolumeToggle = () => {
    this.slidingIn = !this.slidingIn

    if (this.lastAnimation != null) {
      this.lastAnimation.stop()
    }

    this.lastAnimation = Animated.spring(this.state.volumeSliderOffset, {
      toValue: this.slidingIn ? 1 : 0,
      duration: 250,
    })

    this.lastAnimation.start(() => {
      this.lastAnimation = null
    })
  }

  handleVolumeChange = (newValue) => {
    const { setVolume, navigation } = this.props
    setVolume(newValue)
  }

  render() {
    const { volumeSliderOffset } = this.state
    const { volume, theme } = this.props

    const volumeBarStyle = {
      flex: 1,
      position: 'absolute',
      left: 0,
      right: 0,
      elevation: 1,
      height: VolumeBarHeight,
      top: 0,
      transform: [{
        translateY: volumeSliderOffset.interpolate({
          inputRange: [0, 1],
          outputRange: [-VolumeBarHeight, 0]
        })
      }]
    }

    const themeValue = ThemeManager.instance().getTheme(theme)
    const backgroundColor = themeValue.backgroundColor
    const textColor = themeValue.mainTextColor
    const lightTextColor = themeValue.lightTextColor

    return (
      <View style={{...styles.container, backgroundColor: backgroundColor}}>
        <AlbumArt />
        <CurrentSong color={textColor} />
        <SongProgress enabledColor={textColor} disabledColor={lightTextColor} />
        <Controls enabledColor={textColor} disabledColor={lightTextColor} />
        <Animated.View style={volumeBarStyle}>
          <VolumeControl volume={volume} onChange={this.handleVolumeChangeThrottled} theme={theme} />
        </Animated.View>
      </View>
    )
  }
}

const mapStateToProps = state => {
  const { volume } = state.status
  const { theme } = state.storage
  return { volume, theme }
}

const mapDispatchToProps = dispatch => ({
  setVolume: (volume) => dispatch(setVolume(volume))
})

export default connect(mapStateToProps, mapDispatchToProps)(Player)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    padding: 20,
  },
})

