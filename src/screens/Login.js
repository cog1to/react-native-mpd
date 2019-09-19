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

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
}

class KeyboardAwareLoginForm extends React.Component {
    constructor(props) {
        super(props)
        this.inputOffset = new Animated.Value(0)
        this.imageOpacity = new Animated.Value(1)

        this.state = {
            layout: null
        }
    }

    static propTypes = {
        // From `KeyboardState`
        screenY: PropTypes.number.isRequired,
        keyboardHeight: PropTypes.number.isRequired,
        keyboardVisible: PropTypes.bool.isRequired,
        keyboardWillShow: PropTypes.bool.isRequired,
        keyboardWillHide: PropTypes.bool.isRequired,
        keyboardAnimationDuration: PropTypes.number.isRequired,

        // Rendering content
        children: PropTypes.func,
    }

    static defaultProps = {
        children: null,
    }

    handleLayout = event => {
        const { nativeEvent: { layout } } = event

        if (this.state.layout == null) {
            this.setState({
                layout,
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            keyboardHeight,
            keyboardVisible,
            keyboardAnimationDuration,
            keyboardWillShow,
            keyboardWillHide,
            screenY,
        } = nextProps

        const { layout } = this.state

        const shouldUpdateLayout = (Platform.OS === 'ios')
            ? (keyboardWillShow || keyboardWillHide)
            : (this.props.keyboardVisible != nextProps.keyboardVisible)

        if (layout != null && shouldUpdateLayout) {
            let animations = []
            
            const keyboardBecomingVisible = (Platform.OS === 'ios')
                ? keyboardWillShow
                : nextProps.keyboardVisible

            animations.push(Animated.timing(this.inputOffset, {
                toValue: keyboardBecomingVisible ? -(layout.y + layout.height - screenY) : 0,
                duration: keyboardAnimationDuration,
                useNativeDriver: true,
            }))

            if (screenY - layout.height < 0 || keyboardWillHide) {
                animations.push(Animated.timing(this.imageOpacity, {
                    toValue: keyboardBecomingVisible ? 0 : 1,
                    duration: keyboardAnimationDuration,
                    useNativeDriver: true,
                }))
            }

            Animated.parallel(animations).start()
        }
    }

    render() {
        const { children } = this.props
        const containerStyle = { transform: [{ translateY: this.inputOffset }] } 
        
        return (
            <Animated.View style={containerStyle} onLayout={this.handleLayout}>
                {children(this.imageOpacity)}
            </Animated.View>
        )
    }
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
        const { port, host, password } = this.state

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
                        <KeyboardAwareLoginForm {...keyboardInfo}>
                            {opacity => children(opacity)}
                        </KeyboardAwareLoginForm>
                    )}
                </KeyboardState>
                <View style={styles.disclaimer}>
                    <Text style={{color: placeholderTextColor, textAlign: 'center', fontSize: 11}}>
                        © 2019{'\n'}Cover art powered by Last.fm
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
