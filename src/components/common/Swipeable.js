import React from 'react'
import PropTypes from 'prop-types'
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import Draggable from './Draggable'

export default class Swipeable extends React.Component {
  static propTypes = {
    icon: PropTypes.string.isRequired,
    onSwipe: PropTypes.func.isRequired,
    underlayColor: PropTypes.string.isRequired,
    iconColor: PropTypes.string.isRequired,
    onSwipeStarted: PropTypes.func,
    enabled: PropTypes.bool.isRequired,
    id: PropTypes.string.isRequired,
  }

  static defaultProps = {
    underlayColor: '#000000',
    iconColor: '#FFFFFF',
    canDelete: false,
  }

  constructor(props) {
    super(props)
    this.animatedValue = {
      left: new Animated.Value(0),
      leftOpacity: new Animated.Value(0),
      rightOpacity: new Animated.Value(0),
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.id != nextProps.id) {
      this.animatedValue.left.setValue(0)
    }
  }

  handleShouldHandle = ({ top, left }) => {
    return (Math.abs(top) < 10 && Math.abs(left) > 10)
  }

  handleTouchStart = () => { }

  handleTouchMove = ({ top, left }) => {
    this.animatedValue.left.setValue(left)
    this.leftIcon.setNativeProps({ style: { opacity: (left > 0) ? 1.0 : 0.0 }})
    this.rightIcon.setNativeProps({ style: { opacity: (left > 0) ? 0.0 : 1.0 }})
  }

  handleTouchEnd = ({ top, left }, velocity) => {
    const width = Dimensions.get('window').width
    
    if (Math.abs(left) > width*0.25 || Math.abs(velocity) > 2.5) {
        Animated.spring(this.animatedValue.left, {
            toValue: (left > 0 ? width : (-width)),
            friction: 30,
            tension: 300,                
            useNativeDriver: true
        }).start(this.onSwipe)
    } else {
        Animated.spring(this.animatedValue.left, {
            toValue: 0,
            friction: 30,
            tension: 300,
            useNativeDriver: true
        }).start()
    }
  }

  onSwipe = () => {
    const { onSwipe } = this.props
    onSwipe()
  }

  render() {
    const { icon, underlayColor, iconColor, enabled } = this.props
    
    return (
      <View>
        <Draggable
          enabled={enabled}
          onTouchStart={() => this.handleTouchStart()}
          onTouchMove={offset => this.handleTouchMove(offset)}
          onTouchEnd={(offset, velocity) => this.handleTouchEnd(offset, velocity)}
          onShouldHandle={(offset) => this.handleShouldHandle(offset)}>
          {({ handlers, dragging }) => {
            const style = {
              transform: [
                {
                    translateX: this.animatedValue.left
                }
              ]
            }

            return (
              <Animated.View {...handlers} style={[styles.foreground, style]}>
                {this.props.children}
              </Animated.View>
            )
          }}
        </Draggable>
        <View style={{...styles.background, backgroundColor: underlayColor}}>
          <View style={styles.centeredTextContainer}>
            <Icon ref={(component) => this.leftIcon = component} name={icon} size={24} color={iconColor} />
          </View>
          <View style={styles.centeredTextContainer}>
            <Icon ref={(component) => this.rightIcon = component} name={icon} size={24} color={iconColor} />
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  foreground: {
    zIndex: 2, 
    backgroundColor: 'white',
  },
  background: {
    zIndex: 1,
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'black',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centeredTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    aspectRatio: 1.5
  },
})

