import React from 'react'
import {
    View,
    Alert,
} from 'react-native'

// Actions.
import { disconnect } from '../redux/reducers/status/actions'

// MPD Redux.
import store from '../redux/store'

// Main screen common functions. Handles disconnect button events.
export default class MainScreen extends React.Component {
    componentDidMount() {
        this.props.navigation.setParams({
            onExit: this.onExit
        })
    }

    onExit() {
        Alert.alert(
            'Log out',
            'Are you sure you want to disconnect from current MPD server?',
            [
                {
                    text: 'Disconnect',
                    onPress: () => store.dispatch(disconnect())
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ],
            {cancelable: true},
        )
    }
}
