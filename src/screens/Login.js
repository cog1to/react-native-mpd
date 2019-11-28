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
    SafeAreaView,
    UIManager,
    Animated,
} from 'react-native';
import Input from '../components/common/Input'

// Actions.
import { connect } from '../redux/reducers/status/actions'
import { saveAddress, loadSavedAddress } from '../redux/reducers/storage/actions'

// Redux.
import { connect as reduxConnect } from 'react-redux'
import { bindActionCreators } from 'redux'

// Keyboard state listener.
import KeyboardState from '../components/common/KeyboardState'

// Safe area check.
import { isIphoneX } from '../utils/IsIphoneX';

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
        const { error, address } = this.props

        // Placeholder text color.
        const placeholderTextColor = ThemeManager.instance().getCurrentTheme().activeColor + '55'

        // Image size.
        const imageHeight = Dimensions.get('window').height / 7

        let children = (opacity) => (
            <View style={styles.credentialsContainer}>
                <Animated.Image
                    source={require('../../assets/images/yamp_big_logo.png')}
                    style={{resizeMode: 'contain', width: imageHeight, height: imageHeight, opacity }} />
                <Input
                    style={styles.input}
                    placeholderTextColor={placeholderTextColor}
                    placeholder='Host'
                    onChangeText={this.handleHostChange}
                    selectionColor='#ffffff'
                    value={host} />
                <Input
                    style={styles.input}
                    placeholderTextColor={placeholderTextColor}
                    selectionColor='#ffffff'
                    placeholder='Port'
                    onChangeText={this.handlePortChange}
                    value={port} />
                <Input
                    style={styles.input}
                    placeholderTextColor={placeholderTextColor}
                    placeholder='Password (optional)' 
                    selectionColor='#ffffff'
                    onChangeText={this.handlePasswordChange} 
                    value={password} 
                    autoCapitalize='none'
                    autoCompleteType='off'
                    autoCorrect={false} />
                <View style={{marginVertical: 18}}>
                    <Button
                        title='Connect'
                        onPress={this.handleSubmit}
                        color={ThemeManager.instance().getCurrentTheme().activeColor}
                    />
                </View>
            </View>
        )

        return (
            <SafeAreaView style={styles.container}>
                <KeyboardState>
                    {keyboardInfo => (
                        <KeyboardAwareView {...keyboardInfo}>
                            {opacity => children(opacity)}
                        </KeyboardAwareView>
                    )}
                </KeyboardState>
                <View style={styles.disclaimer}>
                    <Text style={{color: placeholderTextColor, textAlign: 'center', fontSize: 11}}>
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

    let actualError = (connectionError != null ? connectionError.message : (storageError != null ? storageError.message : null))
    
    // Pre-formatting for MPD errors.
    let mpdError = /\[\d+@\d+\] \{.*\} (.*)/
    if (actualError != null && mpdError.test(actualError)) {
        let match = mpdError.exec(actualError)
        actualError = match[1]
    }

    return { address: address, error: actualError }
}

const mapDispatchToProps = dispatch => ({
    connect: (host, port, password) => dispatch(connect(host, port, password)),
    loadSavedAddress: () => dispatch(loadSavedAddress()),
})

export default reduxConnect(mapStateToProps, mapDispatchToProps)(Login)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ThemeManager.instance().getCurrentTheme().accentColor,
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
        bottom: isIphoneX() ? 24 : 8,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    input: {
        color:ThemeManager.instance().getCurrentTheme().activeColor,
        flex: 1,
        width: '100%',
        maxWidth: 400,
    }
})
