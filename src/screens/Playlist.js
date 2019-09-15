import React from 'react'
import {
    View,
    StyleSheet,
} from 'react-native'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { getPlaylist } from '../redux/reducers/playlists/actions'

// Items list.
import ItemsList from '../components/ItemsList'

class Playlist extends React.Component {
    componentDidMount() {
        this.reload()
    }

    reload = () => {
        const { navigation, getPlaylist } = this.props
        const { state: { params: { name } } } = navigation
        getPlaylist(name)
    }

    render() {
        const { content, navigation, loading } = this.props

        return (
            <View style={styles.container}>
                <ItemsList
                    content={content} 
                    navigation={navigation}
                    refreshing={loading}
                    onReload={this.reload}
                    subtitle={this.getLastModified}
                    onNavigate={this.onNavigate}
                />
            </View>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    const { navigation: { state: { params: { name = null } } } } = ownProps
    const playlist = state.playlists.playlists.find(item => { return item.name == name })

    return {
        content: playlist.tracks != null ? playlist.tracks : [],
        loading: state.playlists.loading,
    }
}

const mapDispatchToProps = dispatch => ({
    getPlaylist: (name) => dispatch(getPlaylist(name))
})

export default connect(mapStateToProps, mapDispatchToProps)(Playlist)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})
