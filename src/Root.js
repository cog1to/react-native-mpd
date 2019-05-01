// Basic react stuff.
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { NavigationActions } from 'react-navigation'
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

class Root extends Component {
    constructor(props) {
        super(props)
    }
    
    componentWillUpdate(nextProps, nextState) {
        if (nextProps && nextProps.connected != this.props.connected) {
            if (nextProps.connected) {
                this.navigator && this.navigator.dispatch(
                    NavigationActions.navigate({ routeName: 'Home' })
                )
            } else {
                this.navigator && this.navigator.dispatch(
                    NavigationActions.back({})
                )
            }
        }
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <StatusBar translucent={true} backgroundColor="#FFFFFF" barStyle="dark-content" />
                <AppContainer
                    ref={ nav => { this.navigator = nav } }
                />
            </View>
        )
    }
}

const mapStateToProps = state => {
    let connected = state.status.connected
    return {
        connected: connected
    }
}

export default reduxConnect(mapStateToProps)(Root)
