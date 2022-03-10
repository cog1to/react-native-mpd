import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  Button,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  UIManager,
  Animated,
  TouchableOpacity
} from 'react-native'
import Input from '../components/common/Input'
import { SafeAreaView } from 'react-native-safe-area-context'

// Actions.
import { connect } from '../redux/reducers/status/actions'
import { saveAddress, loadSavedAddress } from '../redux/reducers/storage/actions'
import { loadLibraryMode } from '../redux/reducers/storage/actions'

// Redux.
import { connect as reduxConnect } from 'react-redux'
import { bindActionCreators } from 'redux'

// Keyboard state listener.
import KeyboardState from '../components/common/KeyboardState'

// Safe area check.
import { isIphoneX, isIpadPro } from '../utils/IsIphoneX';

// Themes.
import ThemeManager from '../themes/ThemeManager'

// Global error banner.
import ErrorBanner from '../components/ErrorBanner'

// Keyboard aware view.
import KeyboardAwareView from '../components/common/KeyboardAwareView'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

class Login extends React.Component {
  state = {
    host: null,
    port: null,
    password: null,
    onSubmit: () => {}
  }

  componentDidMount() {
    this.props.loadSavedAddress()
    this.props.loadLibraryMode()
  }

  componentDidUpdate(prevProps, prevState) {
    const { address } = this.props
    if (prevProps.address == null && this.props.address != null) {
      this.setState({
        host: address.host,
        port: address.port,
      })
    }
  }

  handleHostChange = (host) => {
    this.setState({
      host: host,
    })
  }

  handlePortChange = (port) => {
    this.setState({
      port: port,
    })
  }

  handlePasswordChange = (password) => {
    this.setState({
      password: password,
    })
  }

  connectToMpd = (host, port, password = null) => {
    const { connect } = this.props
    connect(host, port, password)
  }

  handleSubmit = () => {
    let { port, host, password } = this.state

    port = port != null ? port.trim() : null
    host = host != null ? host.trim() : null

    this.connectToMpd(host, port, password != null && password.length > 0 ? password : null)
  }

  render() {
    const { port, host, password } = this.state
    const { error, address, theme } = this.props

    // Placeholder text color.
    const themeValue = ThemeManager.instance().getTheme(theme)
    const placeholderTextColor = themeValue.darkPlaceholderColor
    const disclaimerColor = themeValue.activeColor + '7F'

    // Image size.
    const imageHeight = Dimensions.get('window').height / 7

    let children = (opacity) => (
      <View style={styles.credentialsContainer}>
        <Animated.Image
          source={require('../../assets/images/yamp_big_logo.png')}
          style={{resizeMode: 'contain', width: imageHeight, height: imageHeight, opacity }} />
        <Input
          style={{...styles.input}}
          textColor={themeValue.activeColor}
          placeholderColor={placeholderTextColor}
          placeholder='Host'
          onChangeText={this.handleHostChange}
          selectionColor='#ffffff'
          value={host} />
        <Input
          style={{...styles.input}}
          textColor={themeValue.activeColor}
          placeholderColor={placeholderTextColor}
          selectionColor='#ffffff'
          placeholder='Port'
          onChangeText={this.handlePortChange}
          value={port} />
        <Input
          style={{...styles.input}}
          textColor={themeValue.activeColor}
          placeholderColor={placeholderTextColor}
          placeholder='Password (optional)'
          selectionColor='#ffffff'
          onChangeText={this.handlePasswordChange}
          value={password}
          autoCapitalize='none'
          autoCompleteType='off'
          autoCorrect={false} />
        <View style={{marginVertical: 24}}>
          <TouchableOpacity style={{...styles.button, backgroundColor: themeValue.activeColor}} onPress={this.handleSubmit}>
            <Text style={{...styles.buttonText, color: themeValue.navBarColor}}>Connect</Text>
          </TouchableOpacity>
        </View>
      </View>
    )

    return (
      <SafeAreaView style={{...styles.container, backgroundColor: themeValue.navBarColor}}>
        <KeyboardState>
          {keyboardInfo => (
            <KeyboardAwareView {...keyboardInfo}>
              {opacity => children(opacity)}
            </KeyboardAwareView>
          )}
        </KeyboardState>
        <View style={styles.disclaimer}>
          <Text style={{color: disclaimerColor, textAlign: 'center', fontSize: 11}}>
            © 2019{'\n'}Cover art powered by Last.fm{'\n'}Artist art powered by Discogs
          </Text>
        </View>
        <ErrorBanner error={error} />
      </SafeAreaView>
    )
  }
}

const mapStateToProps = state => {
  const { address, error: storageError } = state.storage
  const { connectionError } = state.status
  const { theme } = state.storage

  let actualError = (connectionError != null ? connectionError.message : (storageError != null ? storageError.message : null))

  // Pre-formatting for MPD errors.
  let mpdError = /\[\d+@\d+\] \{.*\} (.*)/
  if (actualError != null && mpdError.test(actualError)) {
    let match = mpdError.exec(actualError)
    actualError = match[1]
  }

  return { address: address, error: actualError, theme: theme }
}

const mapDispatchToProps = dispatch => ({
  connect: (host, port, password) => dispatch(connect(host, port, password)),
  loadSavedAddress: () => dispatch(loadSavedAddress()),
  loadLibraryMode: () => dispatch(loadLibraryMode()),
})

export default reduxConnect(mapStateToProps, mapDispatchToProps)(Login)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  credentialsContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
  },
  errorText: {
    color: 'white',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    marginBottom: 10,
  },
  disclaimer: {
    position: 'absolute',
    bottom: (isIphoneX() || isIpadPro()) ? 24 : 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    width: '100%',
    maxWidth: 400,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3
  },
  buttonText: {
    fontSize: 18,
    lineHeight: 21,
    fontWeight: 'bold',
  }
})
