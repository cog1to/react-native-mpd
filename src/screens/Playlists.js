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
import { getPlaylists, newPlaylist, deletePlaylists } from '../redux/reducers/playlists/actions'

// Items list.
import ItemsList from '../components/ItemsList'

// Date parsing.
import Moment from 'moment'

// New playlist dialog.
import AppPromptDialog from '../components/common/AppPromptDialog'

class Playlists extends React.Component {
    state = {
        showingNewDialog: false,
    }

    componentDidMount() {
        this.props.navigation.setParams({ onMenu: this.handleMenuPress })
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

    handleMenuPress = () => {
        this.setState({
            showingNewDialog: true,
        })
    }

    handleDelete = (items) => {
        const names = items.map((item) => { return item.name })
        const { deletePlaylists } = this.props
        deletePlaylists(names)
    }

    render() {
        const { content, navigation, loading, } = this.props
        const { state: { params: { callback } } } = navigation
        const { showingNewDialog } = this.state

        const canAddItems = callback == null

        return (
            <View style={styles.container}>
                <ItemsList
                    content={content} 
                    navigation={navigation}
                    refreshing={loading}
                    onReload={this.reload}
                    subtitle={this.getLastModified}
                    onNavigate={this.onNavigate}
                    canAddItems={canAddItems}
                    onSelection={callback}
                    onDelete={this.handleDelete}
                />
                {showingNewDialog && (
                    <AppPromptDialog
                        prompt='Create new playlist:'
                        placeholder='Playlist name'
                        cancelButton={{
                            title: 'Cancel',
                            onPress: this.handleDailogCancel
                        }}
                        confirmButton={{
                            title: 'Create',
                            onPress: this.handleDialogConfirm
                        }}
                    />
                )}
            </View>
        )
    }

    // New Playlist dialog.
    
    handleDailogCancel = () => {
        this.setState({
            showingNewDialog: false,
        })
    }

    handleDialogConfirm = (name) => {
       const { navigation } = this.props
       const { state: { params: { callback = null } } } = navigation
       if (callback) {
           callback(name)
       }
    }
}

const mapStateToProps = state => {
    return {
        content: state.playlists.playlists != null ? state.playlists.playlists : [],
        loading: state.playlists.loading,
    }
}

const mapDispatchToProps = dispatch => ({
    getPlaylists: () => dispatch(getPlaylists()),
    deletePlaylists: (names) => dispatch(deletePlaylists(names)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Playlists)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})
