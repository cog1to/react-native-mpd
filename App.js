/**
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react'
import {Platform, StyleSheet, Text, View, Button} from 'react-native'

import MpdClientWrapper from './utils/MpdClientWrapper'
import MpdContext from './utils/MpdContext'

import LoginScreen from './screens/Login'
import Player from './screens/Player'

const uuidv1 = require('uuid/v1')

export default class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      error: null,
      messages: [],
      mpdContext: {
        client: null
      }
    }

    this.disconnects = []
  }
   
  connect = async (host, port) => {
    try {
      var client = new MpdClientWrapper();
      await client.connect(host, port)

      this.setState({
        error: null,
        mpdContext: {
          ...this.state.mpdContext,
          client: client
        }
      })

      this.disconnects.push(client.onPlayerUpdate(() => {
        var { messages } = this.state

        var newMessages = messages.slice()
        newMessages.push('updated player state')

        this.setState({
          messages: newMessages
        })
      }))

      this.disconnects.push(client.onMixerUpdate(() => {
        var { messages } = this.state

        var newMessages = messages.slice()
        newMessages.push('updated mixer state')

        this.setState({
          messages: newMessages
        })
      }))

      this.disconnects.push(client.onQueueUpdate(() => {
        var { messages } = this.state

        var newMessages = messages.slice()
        newMessages.push('updated playlist state')

        this.setState({
          messages: newMessages
        })
      }))
    } catch (error) {
      this.setState({
        error: error,
        mpdContext: {
          ...this.state.mpdContext,
          client: null
        }
      })
    }
  }

  onSubmit = (host, port) => {
    const {mpdContext: {client}} = this.state
    this.connect(host, port)
  }

  onComponentWillUnmount() {
    this.disconnectPlayerState()
    this.disconnectMixer()
  }

  render() {
    const {mpdContext: {client, connect}, error, messages} = this.state;
    const connected = (client !== null);

    return (
      <MpdContext.Provider value={this.state.mpdContext}>
        {connected && (
          <Player />
        )}        
        {!connected && (          
          <LoginScreen onSubmit={this.onSubmit} error={error} />
        )}
      </MpdContext.Provider>
    )
 }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
