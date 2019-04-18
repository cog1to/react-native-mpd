import React from 'react'
import {
    View,
    StyleSheet,
} from 'react-native'

import BrowseList from '../components/BrowseList'

export default class Browse extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <BrowseList />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

