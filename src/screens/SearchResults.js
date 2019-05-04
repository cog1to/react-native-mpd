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
        const { navigation: { state: { params: { content } } } } = this.props

        return (
            <View style={styles.container}>
                <ItemsList content={content} onNavigate={this.onNavigate} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
