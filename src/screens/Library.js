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
import Browsable from '../components/common/Browsable'

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
        const { content, navigation, loading, queueSize, position } = this.props
        const artists = ((content !== null) ? Object.keys(content) : []).map((name, index) => ({
            icon: index + 1,
            title: name,
            subtitle: 'ARTIST',
            name: name,
            type: 'ARTIST',
            path: name,
            status: 'none',
        }))

        return (
            <View style={styles.container}>
                <Browsable
                    content={artists}
                    onNavigate={this.onNavigate}
                    navigation={navigation}
                    onRefresh={this.reload}
                    refreshing={loading}
                    queueSize={queueSize}
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
    const { position = null, file = null } = state.currentSong

    return {
        content: library,
        loading: loading,
        queueSize: state.queue.length,
        position
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
