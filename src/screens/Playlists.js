import React from 'react'
import {
    View,
    StyleSheet,
} from 'react-native'

// Navigation.
import { NavigationActions } from 'react-navigation'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { getPlaylists } from '../redux/reducers/playlists/actions'

// Items list.
import ItemsList from '../components/ItemsList'

// Date parsing.
import Moment from 'moment'

class Playlists extends React.Component {
    componentDidMount() {
        Moment.locale('en')
        this.reload()
    }

    reload = () => {
        const { getPlaylists } = this.props
        getPlaylists()
    }

    getLastModified = (item) => {
        return 'Last updated at ' + Moment(item.lastModified).format('HH:mm, MMM D, YYYY')
    }

    onNavigate = (item) => {
        const { navigation } = this.props

        const action = NavigationActions.navigate({
            params: {
                name: item.name,
            },
            routeName: 'Playlist',
            key: 'Playlist-' + item.name,
        })
        navigation.dispatch(action)
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

const mapStateToProps = state => {
    return {
        content: state.playlists.playlists != null ? state.playlists.playlists : [],
        loading: state.playlists.loading,
    }
}

const mapDispatchToProps = dispatch => ({
    getPlaylists: () => dispatch(getPlaylists())
})

export default connect(mapStateToProps, mapDispatchToProps)(Playlists)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})
