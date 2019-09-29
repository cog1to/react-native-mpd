import React from 'react'
import {
    View,
    Animated,
    TouchableWithoutFeedback,
} from 'react-native'
import PropTypes from 'prop-types'

import ThemeManager from '../../themes/ThemeManager'

export const HighlightableView = (WrappedComponent) => {
    return class extends React.Component {
        state = {
            pressed: false,
            selected: false,
        }

        constructor(props) {
            super(props)
            this.animatedValue = new Animated.Value(0)
            this.animating = false
        }

        static propTypes = {
            highlightColor: PropTypes.string.isRequired,
            duration: PropTypes.number.isRequired,
            onTap: PropTypes.func.isRequired,
            onLongTap: PropTypes.func,
            height: PropTypes.number,
        }

        static defaultProps = {
            highlightColor: ThemeManager.instance().getCurrentTheme().accentColor + '50',
            duration: 200,
            height: null,
            onLongTap: null,
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
        
        componentWillUpdate(nextProps, nextState) {
            if (nextState.pressed || nextProps.selected) {
                this.animatedValue.setValue(1)
            } else {
                this.animateBackground(0)
            }
        }

        onAnimationEnded = (endValue) => {
            if ((this.state.pressed || this.props.selected) && endValue == 0) {
                this.animateBackground(1)
            } else if (!(this.state.pressed || this.props.selected) && endValue == 1) {
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
            const { onTap, item } = this.props
            onTap(item)
        }

        handleLongPress = () => {
            const { onLongTap, item } = this.props
            onLongTap(item)
        }

        // Rendering.

        render() {
            const { highlightColor, height, onLongTap } = this.props
            
            const opacity = this.animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1]
            })

            const highlightViewStyle = {
                backgroundColor: highlightColor,
                opacity: opacity,
                position: 'absolute',
                width: '100%',
                height: '100%',
                zIndex: -1,
            }

            const containerStyle = height != null ? { height: height } : {}

            return (
                <TouchableWithoutFeedback
                    onPressIn={this.handlePressIn}
                    onPressOut={this.handlePressOut}
                    onPress={this.handlePress}
                    onLongPress={onLongTap ? this.handleLongPress : null}>
                    <View style={containerStyle}>
                        <WrappedComponent {...this.props} />
                        <Animated.View style={highlightViewStyle} />
                    </View>
                </TouchableWithoutFeedback>
            )
        }
    }
}
