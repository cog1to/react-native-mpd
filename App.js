/**
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

// Basic react stuff.
import React, { Component } from 'react'

// Root component for wrapping Redux provider.
import Root from './src/Root'

// Redux.
import { Provider } from 'react-redux'

// MPD Redux.
import store from './src/redux/store'

export default class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <Root />
            </Provider>
        )
    }
}
