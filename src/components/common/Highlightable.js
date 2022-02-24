import React from 'react'
import {
    View,
    Text,
    TouchableWithoutFeedback,
    Animated,
} from 'react-native'
import PropTypes from 'prop-types'

export default class Highlightable extends React.Component {
  static propTypes = {
    underlayColor: PropTypes.string.isRequired,
    foregroundColor: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    highlighted: PropTypes.bool.isRequired,
    onPress: PropTypes.func.isRequired,
    onLongPress: PropTypes.func,
  }

  static defaultProps = {
    duration: 250,
    highlighted: false,
  }

  state = {
    pressed: false,
  }

  constructor(props) {
    super(props)
    this.animatedValue = new Animated.Value(0)
    this.animating = false
  }

  // State manipulation.
    
  deselect = () => {
    this.setState({
      pressed: false,
    })
  }

  select = () => {
    this.setState({
      pressed: true,
    })
  }

  // Animations.
    
  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (nextState.pressed || nextProps.highlighted) {
      this.animatedValue.setValue(1)
    } else {
      this.animateBackground(0)
    }
  }

  onAnimationEnded = (endValue) => {
    if ((this.state.pressed) && endValue == 0) {
      this.animateBackground(1)
    } else if (!(this.state.pressed) && endValue == 1) {
      this.animateBackground(0)
    } else {
      this.animating = false
    }
  }
    
  animateBackground = (endValue) => {
    const { duration } = this.props
        
    this.animating = true
    Animated.timing(
      this.animatedValue,
      {
         toValue: endValue,
         duration: duration/2,
         useNativeDriver: false
      }
    ).start(() => this.onAnimationEnded(endValue))
  }

  // Touch events.

  handlePressIn = () => {
    this.select()
  }

  handlePressOut = () => {
    this.deselect()
  }

  handlePress = () => {
    this.props.onPress()
  }

  // Rendering.

  render() {
    const { underlayColor, foregroundColor, height, onLongTap, highlighted } = this.props
        
    const highlightColor = this.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [foregroundColor, underlayColor],
      useNativeDriver: true
    })

    const style = {
      backgroundColor: highlighted ? underlayColor : highlightColor,
    }

    return (
      <TouchableWithoutFeedback
        onPressIn={this.handlePressIn}
        onPressOut={this.handlePressOut}
        onPress={this.handlePress}
        onLongPress={this.props.onLongPress}
      >
        <Animated.View style={style}>
          {this.props.children}
        </Animated.View>
      </TouchableWithoutFeedback>
    )
  }
}

