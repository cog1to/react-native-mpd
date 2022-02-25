// Basic react stuff.
import React, { Component } from 'react'
import { connect as reduxConnect } from 'react-redux'
import { View, StatusBar, AppState } from 'react-native'
import { Appearance, useColorScheme } from 'react-native'
import { CommonActions } from '@react-navigation/native'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'

// Actions.
import { connect, error, disconnect, setIntentional } from './redux/reducers/status/actions'
import { loadArtistArt } from './redux/reducers/artists/actions'
import { saveTheme, themeChanged } from './redux/reducers/storage/actions'

// Navigator.
import AppContainer from './Routes'

// Themes.
import ThemeManager from './themes/ThemeManager'

// Global error banner.
import ErrorBanner from './components/ErrorBanner'

// App dialog.
import AppDialog from './components/common/AppDialog'

// Safe area view.
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'

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
      this.defaultHandler = (ErrorUtils.getGlobalHandler && ErrorUtils.getGlobalHandler())
        || ErrorUtils._globalHandler
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
    const { loadArtistArt, saveTheme } = this.props

    AppState.addEventListener('change', this.handleAppStateChange)

    // Update on dark/light mode switch.
    this.subscription = Appearance.addChangeListener(({ colorScheme }) => {
      saveTheme(colorScheme == 'light' ? 'Light' : 'Dark')
    })

    // Save initial theme value.
    saveTheme((Appearance.getColorScheme() == 'light') ? 'Light' : 'Dark')

    loadArtistArt()
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange)
  }

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    if (nextProps && nextProps.connected && nextProps.commands != null) {
      this.navigator && this.navigator.dispatch(
        CommonActions.navigate('Home')
      )

      if (this.state.reconnectState == RECONNECT_STATE.RECONNECTING
        || this.state.reconnectState == RECONNECT_STATE.FAILED) {
        this.setState({
          reconnectState: RECONNECT_STATE.NOTHING,
        })
      }
    } else if (!nextProps.connected) {
      if (nextProps.intentional === true) {
        const navigateAction = CommonActions.navigate('Login')

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
    const { reconnectState } = this.state
    const { resetAttempts } = this.props

    if (this.timeout != null) {
      clearTimeout(this.timeout)
    }

    if (reconnectState == RECONNECT_STATE.WAITING) {
      this.setState({
        timeRemaining: 0,
      }, this.updateTimer)
    } else {
      // Trigger reconnect.
      const { address, connect, attempt } = this.props
      this.setState({
        reconnectState: RECONNECT_STATE.RECONNECTING,
      }, () => {
        connect(address.host, address.port, address.password, 0)
      })
    }
  }

  render() {
    const { error, theme } = this.props
    const { reconnectState, timeRemaining } = this.state

    const reconnectText = (timeRemaining > 0)
      ? ('in ' + timeRemaining + ' second' + ((timeRemaining > 1) ? 's' : ''))
      : 'now'

    const reconnectPrompt = reconnectState == RECONNECT_STATE.FAILED
      ? 'Connection to server lost.'
      : 'Connection to server lost. Trying to reconnect ' + reconnectText + '...'

    let darkTheme = {
      ...DefaultTheme,
      dark: true,
      colors: {
        ...DefaultTheme.colors,
        primary: '#d9e3f0',
        background: '#171717',
        navbar: '#2B2E36',
        text: '#EFEFEF',
      }
    }

    let lightTheme = {
      ...DefaultTheme,
      dark: false,
      colors: {
        ...DefaultTheme.colors,
        primary: '#404550',
        background: '#F5F5F5',
        navbar: '#404550',
        text: '#EFEFEF',
      }
    }

    let themeName = theme == 'Light' ? lightTheme : darkTheme

    return (
      <SafeAreaProvider>
        <View style={{flex: 1}}>
          <StatusBar translucent={true} barStyle="light-content" />
            <NavigationContainer ref={ nav => { this.navigator = nav } } theme={themeName}>
              {AppContainer}
            </NavigationContainer>
          {reconnectState != RECONNECT_STATE.NOTHING && (
            <AppDialog
              prompt={reconnectPrompt}
              cancelButton={{ title: 'Disconnect', onPress: this.handleReconnectCancel }}
              confirmButton={{ title: 'Retry Now', onPress: this.handleRetryNow }}
              theme={theme}
            />
          )}
          <ErrorBanner error={error} />
        </View>
      </SafeAreaProvider>
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
  const { theme } = state.storage

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
    theme: theme
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onError: (err) => dispatch(error(err)),
    disconnect: () => dispatch(disconnect()),
    connect: (host, port, password, attempt) => dispatch(connect(host, port, password, attempt)),
    setIntentional: () => dispatch(setIntentional(true)),
    loadArtistArt: () => dispatch(loadArtistArt()),
    saveTheme: (theme) => dispatch(saveTheme(theme))
  }
}

export default reduxConnect(mapStateToProps, mapDispatchToProps)(Root)

