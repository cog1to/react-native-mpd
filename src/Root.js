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
import { connect } from './redux/reducers/status/actions'

// Navigator.
import AppContainer from './Routes'

// Themes.
import ThemeManager from './themes/ThemeManager'

// Global error banner.
import ErrorBanner from './components/ErrorBanner'

class Root extends Component {
    constructor(props) {
        super(props)
    }
    
    static defaultProps = {
        error: null,
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextProps && nextProps.connected && nextProps.commands != null) {
            this.navigator && this.navigator.dispatch(
                    NavigationActions.navigate({ routeName: 'Home' })
            )
        } else if (this.props.connected && !nextProps.connected) {
            this.navigator && this.navigator.dispatch(
                StackActions.popToTop()
            )
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

    return {
        error: actualError,
        connected: state.status.connected,
        commands: state.status.commands,
    }
}

export default reduxConnect(mapStateToProps)(Root)
