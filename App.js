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
import { configureStore } from './src/redux/store'

// Themes.
import ThemeManager from './src/themes/ThemeManager'
import LightTheme from './src/themes/Light'

// Create default themes.
ThemeManager.instance().createTheme('Light', LightTheme)

const store = configureStore()

export default class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <Root />
            </Provider>
        )
    }
}
