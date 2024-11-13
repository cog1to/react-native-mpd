import React from 'react'
import PropTypes from 'prop-types'
import {
  View,
  StyleSheet,
  Text,
  Animated,
  AppState,
} from 'react-native'
import Slider from '@react-native-community/slider'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { seek, startProgressUpdate, stopProgressUpdate } from '../redux/reducers/player/actions'
import { getStatus } from '../redux/reducers/status/actions'

// Themes.
import ThemeManager from '../themes/ThemeManager'

class SongProgress extends React.Component {
  static defaultProps = {
    player: 'stop',
    duration: 1,
    elapsed: 0,
  }

  state = {
    dragging: false,
    value: null,
  }

  formatTime = (time) => {
    const minutes = Math.floor(time / 60).toString()
    const seconds = Math.floor(time % 60).toString()

    return minutes + ":" + (seconds.length === 1 ? "0" + seconds : seconds)
  }

  onValueChange = (value) => {
    this.setState({
      dragging: true,
      value
    })
  }

  onSlidingComplete = () => {
    const { value } = this.state
    const { seek } = this.props

    this.setState({
      dragging: false,
    })
    seek(value)
  }

  handleAppStateChange = (nextState) => {
    const { player, addListener, removeListener } = this.props
    if (player == 'play') {
      if (nextState.match(/inactive|background/)) {
        removeListener()
      } else if (nextState.match(/active/)) {
        addListener()
      }
    }
  }

  componentDidUpdate() {
    const { player, addListener, removeListener } = this.props
    if (player === 'play') {
      addListener()
    } else {
      removeListener()
    }
  }

  componentDidMount() {
    const { getStatus } = this.props
    getStatus()

    // Add app state listener. We don't want to trigger status update when app is background.
    this.onChange = AppState.addEventListener('change', this.handleAppStateChange)
  }

  componentWillUnmount() {
    if (this.onChange) {
      this.onChange.remove()
    }
    
    // Stop status listener.
    const { player, removeListener } = this.props
    removeListener()
  }

  render() {
    const { player, duration, elapsed, enabledColor, disabledColor, theme } = this.props
    const { value, dragging } = this.state

    const disabled = player === 'stop'
    const color = disabled ? disabledColor : enabledColor

    const minimumValue = 0
    const maximumValue = duration > 0 ? duration : 1

    const themeValue = ThemeManager.instance().getTheme(theme)

    return (
      <Animated.View style={[this.props.style, styles.container]}>
        <Slider
          style={{color: color}}
          minimumValue={0}
          maximumValue={maximumValue}
          step={0.5}
          value={dragging ? value : elapsed}
          disabled={disabled}
          onValueChange={this.onValueChange}
          onSlidingComplete={this.onSlidingComplete}
          minimumTrackTintColor={themeValue.activeColor}
          thumbTintColor={themeValue.accentColor}
        />
        {!disabled && (
          <View style={styles.time}>
            <Text style={{...styles.timeText, color: enabledColor}}>
              {this.formatTime(elapsed)}
            </Text>
            <Text style={{...styles.timeText, color: enabledColor}}>
              {this.formatTime(duration)}
            </Text>
          </View>
        )}
      </Animated.View>
    )
  }
}

const mapStateToProps = state => {
  const { player, elapsed, duration } = state.status
  const theme = state.storage.theme

  return {
    player,
    elapsed,
    duration,
    theme
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addListener: () => { dispatch(startProgressUpdate()) },
    removeListener: () => { dispatch(stopProgressUpdate()) },
    seek: (position) => { dispatch(seek(position)) },
    getStatus: () => { dispatch(getStatus()) },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SongProgress)

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  time: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 16
  }
})

