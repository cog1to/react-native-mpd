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

// Redux.
import { connect as reduxConnect } from 'react-redux'

class Login extends React.Component {
    static propTypes = {
        error: PropTypes.object,
    }
    
    static defaultProps = {
        error: null,
    }

    state = {
        host: '10.0.2.2',
        port: '6600',
        onSubmit: () => {}
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
        const { error } = this.props

        return (
            <View style={styles.container}>        
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error.message}</Text>
                    </View>
                )}
                <Input placeholder="Host" onChangeText={this.handleHostChange} value={host} />
                <Input placeholder="Port" onChangeText={this.handlePortChange} value={port} />
                <View style={{marginVertical: 10}}>
                    <Button title="Connect" onPress={this.handleSubmit} />
                </View>
            </View>
        )
    }
}

const mapStateToProps = state => ({})

const mapDispatchToProps = dispatch => ({
    connect: (host, port) => dispatch(connect(host, port))
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
