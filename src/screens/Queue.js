import React from 'react'
import {
    View,
    StyleSheet,
} from 'react-native'

import QueueList from '../components/QueueList'

export default class Queue extends React.Component {
    handleMenuPress = () => {
        const { navigation } = this.props
        navigation.navigate('QueueSettings')
    }

    componentDidMount() {
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
