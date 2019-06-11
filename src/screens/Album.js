import React from 'react'
import {
    View,
    StyleSheet,
} from 'react-native'
import { NavigationActions } from 'react-navigation'

// Items list.
import ItemsList from '../components/ItemsList'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { loadSongs } from '../redux/reducers/library/actions'

class Album extends React.Component {
    componentDidMount() {
        const { loadSongs, content } = this.props
        const { artist, album } = this.props.navigation.state.params

        if (content == null) {
            loadSongs(artist, album)
        }
    }

    render() {
        const { navigation, content } = this.props
        const songs = (content != null) ? content : []

        return (
            <View style={styles.container}>
                <ItemsList content={songs} onNavigate={this.onNavigate} navigation={navigation} />
            </View>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    const { navigation: { state: { params: { artist, album } } } } = ownProps

    return {
        content: state.library[artist][album],
    }
}

const mapDispatchToProps = dispatch => {
    return {
        loadSongs: (artist, album) => dispatch(loadSongs(artist, album))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Album)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
