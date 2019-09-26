// Basic react stuff.
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { NavigationActions, StackActions } from 'react-navigation'
import {
    View,
    StatusBar,
    AppState,
} from 'react-native'

// Actions.
import { connect, error, disconnect, setIntentional } from './redux/reducers/status/actions'

// Navigator.
import AppContainer from './Routes'

// Themes.
import ThemeManager from './themes/ThemeManager'

// Global error banner.
import ErrorBanner from './components/ErrorBanner'

// App dialog.
import AppDialog from './components/common/AppDialog'

// Possible reconnect states.
RECONNECT_STATE = {
    NOTHING: 'NOTHING',
    WAITING: 'WAITING',
    RECONNECTING: 'RECONNECTING',
    FAILED: 'FAILED',
}

// Reconnect timeout base.
RECONNECT_TIME_BASE = 2

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

    state = {
        reconnectState: RECONNECT_STATE.NOTHING,
        timeRemaining: 0,
    }

    attemptToReconnect = (attempt) => {
        this.setState({
            reconnectState: RECONNECT_STATE.WAITING,
            timeRemaining: Math.pow(RECONNECT_TIME_BASE, attempt + 1)
        }, () => {
            this.timeout = setTimeout(this.updateTimer, 1000)
        })
    }

    updateTimer = () => {
        const { timeRemaining, reconnectState } = this.state

        if (reconnectState != RECONNECT_STATE.WAITING) {
            return
        }

        if (timeRemaining > 0) {
            this.setState({
                timeRemaining: this.state.timeRemaining - 1
            }, () => { 
                this.timeout = setTimeout(this.updateTimer, 1000)
            })
        } else {
            // Reset timeout handle.
            this.timeout = null

            // Trigger reconnect.
            const { address, connect, attempt } = this.props
            this.setState({
                reconnectState: RECONNECT_STATE.RECONNECTING,
            }, () => {
                connect(address.host, address.port, address.password, attempt)
            })
        }
    }

    logout = () => {
        // Reset timer.
        this.timeout = null

        // Trigger logout.
        this.setState({
            reconnectState: RECONNECT_STATE.NOTHING,
        }, () => {
            this.props.setIntentional()
        })
    }

    handleAppStateChange = (nextState) => {
        if (this.state.reconnectState == RECONNECT_STATE.WAITING) {
            if (nextState.match(/inactive|background/)) {
                if (this.timeout != null) {
                    clearTimeout(this.timeout)
                }
            } else if (nextState.match(/active/)) {
                this.updateTimer() 
            }
        }
    }

    componentDidMount() {
        AppState.addEventListener('change', this.handleAppStateChange)
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange)
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextProps && nextProps.connected && nextProps.commands != null) {
            this.navigator && this.navigator.dispatch(
                NavigationActions.navigate({ routeName: 'Home' })
            )

            if (this.state.reconnectState == RECONNECT_STATE.RECONNECTING
                || this.state.reconnectState == RECONNECT_STATE.FAILED) {
                this.setState({
                    reconnectState: RECONNECT_STATE.NOTHING,
                })
            }
        } else if (!nextProps.connected) {
            if (nextProps.intentional === true) {
                const navigateAction = NavigationActions.navigate({
                    routeName: 'Login',
                    params: {},
                })

                this.navigator && this.navigator.dispatch(navigateAction)
            } else if (this.props.intentional === false) {
                const { address, connect, attempt, setIntentional } = nextProps
                const { reconnectState } = this.state

                if (attempt < 3 && (reconnectState == RECONNECT_STATE.NOTHING && this.props.connected) 
                    || (reconnectState == RECONNECT_STATE.RECONNECTING && attempt != this.props.attempt)) {
                    this.attemptToReconnect(attempt)
                } else if (attempt == 3 && reconnectState != RECONNECT_STATE.FAILED) {
                    this.setState({
                        reconnectState: RECONNECT_STATE.FAILED,
                    })
                }
            }
        }
    }

    handleReconnectCancel = () => {
        if (this.timeout != null) {
            clearTimeout(this.timeout)
        }

        this.logout() 
    }

    handleRetryNow = () => {
        if (this.timeout != null) {
            clearTimeout(this.timeout)
        }

        this.setState({
            timeRemaining: 0,
        }, this.updateTimer)
    }

    render() {
        const { error } = this.props
        const { reconnectState, timeRemaining } = this.state

        const reconnectText = (timeRemaining > 0)
            ? ('in ' + timeRemaining + ' second' + ((timeRemaining > 1) ? 's' : ''))
            : 'now'

        const reconnectPrompt = reconnectState == RECONNECT_STATE.FAILED
            ? 'Connection to server lost.'
            : 'Connection to server lost. Trying to reconnect ' + reconnectText + '...'

        const navColor = ThemeManager.instance().getCurrentTheme().accentColor
        return (
            <View style={{flex: 1}}>
                <StatusBar translucent={true} backgroundColor={navColor} barStyle="light-content" />
                <AppContainer
                    ref={ nav => { this.navigator = nav } }
                />
                {reconnectState != RECONNECT_STATE.NOTHING && (
                    <AppDialog
                        prompt={reconnectPrompt}
                        cancelButton={{ title: 'Disconnect', onPress: this.handleReconnectCancel }}
                        confirmButton={{ title: 'Retry Now', onPress: this.handleRetryNow }}
                    />
                )}
                <ErrorBanner error={error} />
            </View>
        )
    }

    wrapGlobalHandler = (err, isFatal) => {
        if (!this.props.connected) {
            // If we're already disconnected, just display the error.
            this.props.onError(err)
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