import React from 'react'
import {
    View,
    StyleSheet,
} from 'react-native'

// Main screen features.
import MainScreen from './MainScreen'

// Queue List component.
import QueueList from '../components/QueueList'

export default class Queue extends MainScreen {
    handleMenuPress = () => {
        const { navigation } = this.props
        navigation.navigate('QueueSettings')
    }

    componentDidMount() {
        super.componentDidMount()
        this.props.navigation.setParams({ onMenu: this.handleMenuPress })
    } 

    render() {
        const { navigation } = this.props

        return (
            <View style={styles.container}>
                <QueueList navigation={navigation}/>
            </View>
        )
    }
} 

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
