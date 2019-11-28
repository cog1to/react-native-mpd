import React from 'react'
import {
    View,
    Platform,
    Animated,
} from 'react-native'
import PropTypes from 'prop-types'

export default class KeyboardAwareView extends React.Component {
    constructor(props) {
        super(props)
        this.inputOffset = new Animated.Value(0)
        this.animationState = new Animated.Value(1)

        this.state = {
            layout: null
        }
    }

    static propTypes = {
        // From `KeyboardState`
        screenY: PropTypes.number.isRequired,
        keyboardHeight: PropTypes.number.isRequired,
        keyboardVisible: PropTypes.bool.isRequired,
        keyboardWillShow: PropTypes.bool.isRequired,
        keyboardWillHide: PropTypes.bool.isRequired,
        keyboardAnimationDuration: PropTypes.number.isRequired,

        // Rendering content
        children: PropTypes.func,
        topOffset: PropTypes.number.isRequired,
    }

    static defaultProps = {
        children: null,
        topOffset: 0,
    }

    handleLayout = event => {
        const { nativeEvent: { layout } } = event

        if (this.state.layout == null) {
            this.setState({
                layout,
            })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            keyboardHeight,
            keyboardVisible,
            keyboardAnimationDuration,
            keyboardWillShow,
            keyboardWillHide,
            screenY,
            topOffset,
        } = this.props

        const { layout } = this.state

        const shouldUpdateLayout = (Platform.OS === 'ios')
            ? (keyboardWillShow || keyboardWillHide)
            : (prevProps.keyboardVisible != this.props.keyboardVisible)

        if (layout != null && shouldUpdateLayout) {
            let animations = []
            
            const keyboardBecomingVisible = (Platform.OS === 'ios')
                ? keyboardWillShow
                : this.props.keyboardVisible

            animations.push(Animated.timing(this.inputOffset, {
                toValue: keyboardBecomingVisible ? -(layout.y + layout.height + topOffset - screenY) : 0,
                duration: keyboardAnimationDuration,
                useNativeDriver: true,
            }))

            animations.push(Animated.timing(this.animationState, {
                toValue: keyboardBecomingVisible ? 0 : 1,
                duration: keyboardAnimationDuration,
                useNativeDriver: true,
            }))

            Animated.parallel(animations).start()
        }
    }

    render() {
        const { children } = this.props
        const containerStyle = { transform: [{ translateY: this.inputOffset }] } 
        
        return (
            <Animated.View style={containerStyle} onLayout={this.handleLayout}>
                {children(this.animationState)}
            </Animated.View>
        )
    }
}
