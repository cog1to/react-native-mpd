// Basic react stuff.
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { NavigationActions, StackActions } from 'react-navigation'
import {
    View,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    Platform,
    Button,
    AppState,
} from 'react-native'

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

RECONNECT_STATE = {
    NOTHING: 'NOTHING',
    WAITING: 'WAITING',
    RECONNECTING: 'RECONNECTING',
    FAILED: 'FAILED',
}

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
            timeRemaining: Math.pow(2, attempt + 1)
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
            reconnectState: RECONNECT_STATE.FAILED,
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
                } else if (attempt == 3) {
                    this.logout()
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

    render() {
        const { error } = this.props
        const { reconnectState, timeRemaining } = this.state

        const reconnectText = (timeRemaining > 0)
            ? ('in ' + timeRemaining + ' second' + ((timeRemaining > 1) ? 's' : ''))
            : 'now'

        const navColor = ThemeManager.instance().getCurrentTheme().accentColor

        return (
            <View style={{flex: 1}}>
                <StatusBar translucent={true} backgroundColor={navColor} barStyle="light-content" />
                <AppContainer
                    ref={ nav => { this.navigator = nav } }
                />
                <ErrorBanner error={error} />
                {reconnectState != RECONNECT_STATE.NOTHING && reconnectState != RECONNECT_STATE.FAILED && (
                    <View style={styles.dimOverlay}>
                        <View style={styles.dialog}>
                            <Text style={styles.reconnectText}>
                                Lost server connection. Trying to reconnect {reconnectText}...
                            </Text>
                            <View style={styles.dialogButtonsContainer}>
                                {Platform.OS === 'ios' && (
                                    <Button
                                        onPress={this.handleReconnectCancel}
                                        title='Disconnect'
                                        color={ThemeManager.instance().getCurrentTheme().accentColor}
                                    />
                                )}
                                {Platform.OS === 'android' && (
                                    <TouchableOpacity onPress={this.handleReconnectCancel}>
                                        <Text style={styles.dialogButtonText}>
                                           DISCONNECT
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                )}
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


const styles = StyleSheet.create({
    dimOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: ThemeManager.instance().getCurrentTheme().dialogBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialog: {
        padding: Platform.OS == 'android' ? 25 : 15,
        paddingBottom: 15,
        margin: 20,
        backgroundColor: 'white',
    },
    reconnectText: {
        fontSize: ThemeManager.instance().getCurrentTheme().mainTextSize,
        color: ThemeManager.instance().getCurrentTheme().mainTextColor,
    },
    dialogButtonsContainer: {
        marginTop: Platform.OS == 'android' ? 25 : 15,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    dialogButtonText: {
        color: ThemeManager.instance().getCurrentTheme().accentColor,
        fontWeight: 'bold',
        fontSize: 14,
    }
})
