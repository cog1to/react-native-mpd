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
        const { content, loadArtists } = this.props

        if (content === null) {
            loadArtists()
        }
    }

    render() {
        const { content, navigation } = this.props
        const artists = ((content !== null) ? Object.keys(content) : []).map((name, index) => ({
            icon: index + 1,
            name: name,
            type: 'ARTIST',
            fullPath: name,
        }))

        return (
            <View style={styles.container}>
                <ItemsList content={artists} onNavigate={this.onNavigate} navigation={navigation} />
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
    return {
        content: state.library,
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
