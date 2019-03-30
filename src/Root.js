// Basic react stuff.
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux';

// Screens.
import LoginScreen from './screens/Login'
import Player from './screens/Player'

// Actions.
import { connect } from './redux/mpd/Actions'

class Root extends Component {
    constructor(props) {
        super(props)
    }
    
    connectToMpd = (host, port) => {
        const { connect } = this.props
        connect(host, port)
    }

    render() {
        const { connected } = this.props

        if (connected) {
            return (<Player />)
        } else {
            return (<LoginScreen onSubmit={this.connectToMpd} />)
        }
    }
}

const mapStateToProps = state => {
    let connected = state.connected
    return {
        connected: connected
    }
}

const mapDispatchToProps = dispatch => ({
    connect: (host, port) => dispatch(connect(host, port))
})

export default reduxConnect(mapStateToProps, mapDispatchToProps)(Root)
