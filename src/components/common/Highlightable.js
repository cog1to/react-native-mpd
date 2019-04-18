import React from 'react'

import {
    View,
    TouchableWithoutFeedback,
    StyleSheet,
    Animated,
} from 'react-native'

import PropTypes from 'prop-types'

export default class Highlightable extends React.Component {

    constructor(props) {
        super(props)
        this.animatedValue = new Animated.Value(0)
    }

    static propTypes = {
        highlightColor: PropTypes.string.isRequired,
        baseColor: PropTypes.string.isRequired,
        duration: PropTypes.number.isRequired,
        onPress: PropTypes.func.isRequired,
    }

    static defaultProps = {
        highlightColor: '#aaaaaa',
        baseColor: '#ffffff',
        duration: 150,
    }

    handlePressIn = () => {
        this.animateBackground(1)
    }

    handlePressOut = () => {
        this.animateBackground(0)
    }

    animateBackground = (endValue) => {
        Animated.timing(
            this.animatedValue,
            {
                toValue: endValue,
                duration: 150,
            }
        ).start()
    }

    render() {
        const { baseColor, highlightColor } = this.props

        const backgroundColorValue = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [baseColor, highlightColor]
        })

        return (
            <TouchableWithoutFeedback
                onPressIn={this.handlePressIn}
                onPressOut={this.handlePressOut}
                onPress={this.props.onPress}
            >
                <Animated.View style={this.props.style, { backgroundColor: backgroundColorValue }}>
                    {this.props.children}
                </Animated.View>
            </TouchableWithoutFeedback>
        )
    }
}

