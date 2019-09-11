import React from 'react'
import {
    StyleSheet,
    View,
    FlatList,
    Text,
} from 'react-native'
import { NavigationActions } from 'react-navigation'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { loadArtists } from '../redux/reducers/library/actions'

// Items list.
import ItemsList from '../components/ItemsList'

class Library extends React.Component {
    componentDidMount() {
        const { content } = this.props

        if (content === null) {
            this.reload()
        }
    }

    reload = () => {
        const { loadArtists } = this.props
        loadArtists()
    }

    render() {
        const { content, navigation, loading } = this.props
        const artists = ((content !== null) ? Object.keys(content) : []).map((name, index) => ({
            icon: index + 1,
            name: name,
            type: 'ARTIST',
            fullPath: name,
        }))

        return (
            <View style={styles.container}>
                <ItemsList
                    content={artists}
                    onNavigate={this.onNavigate}
                    navigation={navigation}
                    onReload={this.reload}
                    refreshing={loading}
                />
            </View>
         )
    }

    onNavigate = (item) => {
        const { navigation } = this.props

        const action = NavigationActions.navigate({
            params: {
                name: item.name,
            },
            routeName: 'Artist',
        })
        navigation.dispatch(action)
    }
}

const mapStateToProps = (state, ownProps) => {
    const { library, loading } = state.library

    return {
        content: library,
        loading: loading,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        loadArtists: () => dispatch(loadArtists())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Library)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
