import React from 'react'
import {
    View,
    StyleSheet,
    Text,
    Platform,
    Animated,
} from 'react-native'

// Redux.
import { connect } from 'react-redux'

// Shadow style that works on both iOS and Android.
import { elevationShadowStyle } from '../utils/Styles'

// Global error banner.
class ErrorBanner extends React.Component {
    constructor(props) {
        super(props)

        // Contains last invoked animation.
        this.lastAnimation = null
    }

    state = {
        opacityAnimated: new Animated.Value(0),
        visible: false,
    }

    static defaultProps = {
        error: null,
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.error != nextProps.error) {
            return true
        }

        if (nextState.visible != this.state.visible || this.lastAnimation != null) {
            return true
        }

        return false
    }

    componentDidUpdate(prevProps) {
        if (prevProps.error != this.props.error) {
            if (this.lastAnimation != null) {
                this.lastAnimation.stop()
            }

            this.lastAnimation = Animated.timing(this.state.opacityAnimated, {
                toValue: 1,
                duration: 250,
            })

            this.lastAnimation.start(() => {
                this.lastAnimation = null
            })

            // Reset timer.
            if (this.hideTimeout !== null) {
                clearTimeout(this.hideTimeout)
            }
            this.hideTimeout = setTimeout(this.hide, 5000)

            this.setState({
                visible: true,
            })
        }
    }

    hide = () => {
        this.lastAnimation = Animated.timing(this.state.opacityAnimated, {
            toValue: 0,
            duration: 250,
        })

        this.lastAnimation.start(() => {
            this.lastAnimation = null
        }, () => this.setState({
            visible: false,
        }))

        this.hideTimeout = null
    }

    render() {
        const { error } = this.props
        const { visible, opacityAnimated } = this.state

        if (!visible) {
            return null
        }

        return (            
            <Animated.View style={{...styles.errorContainer, opacity: opacityAnimated}} pointerEvents='none'>
                <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
        )
    }
}

const mapStateToProps = state => {
    const { error: storageError } = state.storage
    const { error } = state.status

    let actualError = error != null ? error : storageError
    
    // Pre-formatting for MPD errors.
    let mpdError = /\[\d+@\d+\] \{.*\} (.*)/
    if (actualError != null && mpdError.test(actualError)) {
        let match = mpdError.exec(actualError)
        actualError = match[1]
    }

    return { error: actualError }
}

export default connect(mapStateToProps)(ErrorBanner)

const styles = StyleSheet.create({
    errorText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    errorContainer: {
        ...elevationShadowStyle(2),
        position: 'absolute',
        padding: 10,
        backgroundColor: 'red',
        borderRadius: 5,
        top: Platform.OS === 'android' ? 95 : 65,
        left: 15,
        right: 15,
        flex: 1,
    }
})

