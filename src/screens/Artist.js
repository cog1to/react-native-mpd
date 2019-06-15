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
import { loadAlbums } from '../redux/reducers/library/actions'

// Items list.
import ItemsList from '../components/ItemsList'

class Artist extends React.Component {
    componentWillMount() {
        const { content, loadAlbums, navigation } = this.props
        const artistName = navigation.state.params.name

        if (content == null) {
            loadAlbums(artistName)
        }
    }

    render() {
        const { content, navigation } = this.props
        let albums = ((content !== null) ? Object.keys(content) : []).map((name, index) => ({ 
            icon: index + 1,
            name: name,
            type: 'ALBUM',
            fullPath: name,
            data: { album: name, artist: navigation.state.params.name },
        }))
 
        return (
            <View style={styles.container}>
                <ItemsList
                    content={albums}
                    onNavigate={this.onNavigate}
                    navigation={navigation}
                />
            </View>
         )
    }

    onNavigate = (item) => {
        const { navigation } = this.props
        const artistName = navigation.state.params.name

        const action = NavigationActions.navigate({
            params: {
                album: item.name,
                artist: artistName,
            },
            routeName: 'Album',
        })
        navigation.dispatch(action)
    }
}

const mapStateToProps = (state, ownProps) => {
    const { navigation: { state: { params: { name } } } } = ownProps
    
    return {
        content: state.library[name],
    }
}

const mapDispatchToProps = dispatch => {
    return {
        loadAlbums: (artist) => dispatch(loadAlbums(artist))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Artist)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

