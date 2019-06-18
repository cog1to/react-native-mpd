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

// Storage.
import LocalStorage from '../storage/LocalStorage'

class Login extends React.Component {
    state = {
        host: null,
        port: null,
        onSubmit: () => {}
    }
  
    componentDidMount() {
        this.props.loadSavedAddress()
    }

    componentDidUpdate() {
        const { address } = this.props
        const { host, port } = this.state
        if (host == null && port == null && address != null) {
            this.setState({
                host: address.host,
                port: address.port,
            })
        }
    }

    handleHostChange = (host) => {
        this.setState({
            host
        })
    }
    
    handlePortChange = (port) => {
        this.setState({
            port
        })
    }

    connectToMpd = (host, port) => {
        const { connect } = this.props
        connect(host, port)
    }

    handleSubmit = () => {
        const { port, host } = this.state

        this.connectToMpd(host, port)
    }

    render() {
        const { port, host } = this.state
        const { error, address } = this.props

        const displayHost = address != null ? address.host : host
        const displayPort = address != null ? address.port : port

        return (
            <View style={styles.container}>        
                {error != null && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error.message}</Text>
                    </View>
                )}
                <Input placeholder='Host' onChangeText={this.handleHostChange} value={displayHost} />
                <Input placeholder='Port' onChangeText={this.handlePortChange} value={displayPort} />
                <View style={{marginVertical: 10}}>
                    <Button title='Connect' onPress={this.handleSubmit} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => {
    const { address, error: storageError } = state.storage
    const { error: connectionError } = state.status
    return { address, error: (connectionError != null ? connectionError : storageError) }
}

const mapDispatchToProps = dispatch => ({
    connect: (host, port) => dispatch(connect(host, port)),
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
