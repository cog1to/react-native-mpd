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
} from 'react-native';
import Input from '../components/common/Input'

// Actions.
import { connect } from '../redux/reducers/status/actions'
import { saveAddress, loadSavedAddress } from '../redux/reducers/storage/actions'

// Redux.
import { connect as reduxConnect } from 'react-redux'
import { bindActionCreators } from 'redux'

// Themes.
import ThemeManager from '../themes/ThemeManager'

// Global error banner.
import ErrorBanner from '../components/ErrorBanner'

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

        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView style={styles.credentialsContainer} behavior="padding">
                    <Image
                        source={require('../../assets/images/yamp_big_logo.png')}
                        style={{resizeMode: 'contain', width: imageHeight, height: imageHeight }} />
                    <Input
                        style={styles.input}
                        placeholderTextColor={placeholderTextColor}
                        placeholder='Host'
                        onChangeText={this.handleHostChange}
                        value={host} />
                    <Input
                        style={styles.input}
                        placeholderTextColor={placeholderTextColor}
                        placeholder='Port'
                        onChangeText={this.handlePortChange}
                        value={port} />
                    <Input
                        style={styles.input}
                        placeholderTextColor={placeholderTextColor}
                        placeholder='Password (optional)' 
                        onChangeText={this.handlePasswordChange} 
                        value={password} 
                        autoCapitalize='none'
                        autoCompleteType='off'
                        autoCorrect={false} />
                    <View style={{marginVertical: 10}}>
                        <Button
                            title='Connect'
                            onPress={this.handleSubmit}
                            color={ThemeManager.instance().getCurrentTheme().activeColor}
                        />
                    </View>
                </KeyboardAvoidingView>
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
        backgroundColor: ThemeManager.instance().getCurrentTheme().accentColor,
    },
    credentialsContainer: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
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
        alignItems: 'center',
        marginBottom: 8,
    },
    input: {
        color:ThemeManager.instance().getCurrentTheme().activeColor,
        flex: 1,
    }
})
