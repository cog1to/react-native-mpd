import React from 'react'
import {
    View,
    StyleSheet,
} from 'react-native'

// Redux.
import { connect } from 'react-redux'

// Items list.
import ItemsList from '../components/ItemsList'

export default class SearchResults extends React.Component {
    render() {
        const { navigation } = this.props
        const { state: { params: { content } } } = navigation

        return (
            <View style={styles.container}>
                <ItemsList content={content} onNavigate={this.onNavigate} navigation={navigation} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
