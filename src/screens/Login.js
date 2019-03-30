import React from 'react';
import PropTypes from 'prop-types';
import { 
  View, 
  StyleSheet,
  Button,
  Text,
} from 'react-native';
import Input from '../components/common/Input'

import { connect } from 'redux'


export default class LoginScreen extends React.Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    error: PropTypes.object,
  }
  
  static defaultProps = {
    error: null,
    onSubmit: () => {}
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

  handleSubmit = () => {
    const { onSubmit } = this.props;
    const { port, host } = this.state;

    onSubmit(host, port);
  }

  render() {
    const { port, host } = this.state;
    const { error } = this.props;

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
