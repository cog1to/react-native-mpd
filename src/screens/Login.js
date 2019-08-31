import React from 'react';
import PropTypes from 'prop-types';
import { 
    View, 
    StyleSheet,
    Button,
    Text,
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

        return (
            <View style={styles.container}>        
                {error != null && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error.message}</Text>
                    </View>
                )}
                <Input placeholder='Host' onChangeText={this.handleHostChange} value={host} />
                <Input placeholder='Port' onChangeText={this.handlePortChange} value={port} />
                <Input 
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
                        color={ThemeManager.instance().getCurrentTheme().accentColor}
                    />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => {
    const { address, error: storageError } = state.storage
    const { connectionError } = state.status
    return { address: address, error: (connectionError != null ? connectionError : storageError) }
}

const mapDispatchToProps = dispatch => ({
    connect: (host, port, password) => dispatch(connect(host, port, password)),
    loadSavedAddress: () => dispatch(loadSavedAddress()),
})

export default reduxConnect(mapStateToProps, mapDispatchToProps)(Login)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: 'white',
    },
    errorContainer: {
        padding: 10,
        backgroundColor: 'red',
        borderRadius: 5,
        marginBottom: 10,
    }
})
