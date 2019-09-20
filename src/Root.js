// Basic react stuff.
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { NavigationActions, StackActions } from 'react-navigation'
import { View, StatusBar } from 'react-native'

// Screens.
import LoginScreen from './screens/Login'
import Player from './screens/Player'
import Queue from './screens/Queue'
import Browse from './screens/Browse'

// Actions.
import { connect, error, disconnect, setIntentional } from './redux/reducers/status/actions'

// Navigator.
import AppContainer from './Routes'

// Themes.
import ThemeManager from './themes/ThemeManager'

// Global error banner.
import ErrorBanner from './components/ErrorBanner'

class Root extends Component {
    constructor(props) {
        super(props)

        if (ErrorUtils._globalHandler) {
            this.defaultHandler = (ErrorUtils.getGlobalHandler && ErrorUtils.getGlobalHandler()) || ErrorUtils._globalHandler
            ErrorUtils.setGlobalHandler(this.wrapGlobalHandler)
        }
    }
    
    static defaultProps = {
        error: null,
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextProps && nextProps.connected && nextProps.commands != null) {
            this.navigator && this.navigator.dispatch(
                NavigationActions.navigate({ routeName: 'Home' })
            )
        } else if (!nextProps.connected) {
            if (this.props.intentional) {
                const navigateAction = NavigationActions.navigate({
                    routeName: 'Login',
                    params: {},
                })

                this.navigator && this.navigator.dispatch(navigateAction)
            } else if (this.props.intentional === false) {
                const { address, connect, attempt, setIntentional } = this.props
                console.log('reconnecting, attempt: ' + attempt)
                if (attempt < 3) {
                    setTimeout(() => connect(address.host, address.port, address.password, attempt+1), Math.pow(3, attempt) * 1000)
                } else {
                    setIntentional()
                }
            }
        }
    }

    render() {
        const { error } = this.props
        const navColor = ThemeManager.instance().getCurrentTheme().accentColor

        return (
            <View style={{flex: 1}}>
                <StatusBar translucent={true} backgroundColor={navColor} barStyle="light-content" />
                <AppContainer
                    ref={ nav => { this.navigator = nav } }
                />
                <ErrorBanner error={error} />
            </View>
        )
    }

     wrapGlobalHandler = (err, isFatal) => {
        if (!this.props.connected) {
            // If we're already disconnected, just display the error.
            this.props.onError(err)
        } else {
            // If we're not disconnected, disconnect. Global error most likely means a socket connection error.
            this.props.disconnect()
        }
    }
}

const mapStateToProps = state => {
    const { error: storageError } = state.storage
    const { error } = state.status

    let actualError = (error != null ? error.message : (storageError != null ? storageError.message : null))
    
    // Pre-formatting for MPD errors.
    let mpdError = /\[\d+@\d+\] \{.*\} (.*)/
    if (actualError != null && mpdError.test(actualError)) {
        let match = mpdError.exec(actualError)
        actualError = match[1]
    }

    return {
        error: actualError,
        connected: state.status.connected,
        commands: state.status.commands,
        intentional: state.status.intentional,
        address: state.storage.address,
        attempt: state.status.attempt,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onError: (err) => dispatch(error(err)),
        disconnect: () => dispatch(disconnect()),
        connect: (host, port, password, attempt) => dispatch(connect(host, port, password, attempt)),
        setIntentional: () => dispatch(setIntentional(true)),
    }
}

export default reduxConnect(mapStateToProps, mapDispatchToProps)(Root)
