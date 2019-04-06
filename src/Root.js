// Basic react stuff.
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux';

// Screens.
import LoginScreen from './screens/Login'
import Player from './screens/Player'
import Queue from './screens/Queue'

// Actions.
import { connect } from './redux/reducers/status/actions'

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
            return (<Queue />)
            //return (<Player />)
        } else {
            return (<LoginScreen onSubmit={this.connectToMpd}/>)
        }
    }
}

const mapStateToProps = state => {
    let connected = state.status.connected
    return {
        connected: connected
    }
}

const mapDispatchToProps = dispatch => ({
    connect: (host, port) => dispatch(connect(host, port))
})

export default reduxConnect(mapStateToProps, mapDispatchToProps)(Root)
