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

// Highlightable view wrapper.
import { HighlightableView } from '../components/common/HighlightableView'

class AlbumView extends React.PureComponent {
    render() {
        const { index, name } = this.props.item

        return (
            <View style={styles.itemContainer}>
                <Text style={styles.status}>
                    {index}
                </Text>
                <View style={styles.description}>
                    <Text style={styles.title} ellipsizeMode='tail' selectable={false} numberOfLines={1}>{name}</Text>
                    <Text style={styles.subtitle}>Album</Text>
               </View>
            </View>
        )
    }
}

const HighlightableAlbumView = HighlightableView(AlbumView)

class Artist extends React.Component {
    componentWillMount() {
        const { content, loadAlbums, navigation } = this.props
        const artistName = navigation.state.params.name

        if (content == null) {
            loadAlbums(artistName)
        }
    }

    renderItem = ({item}) => {
        return (
            <HighlightableAlbumView 
                item={item}
                onTap={this.handleItemSelected}
                onLongTap={this.handleItemLongTap} />
        )
    }

    keyExtractor = (item) => {
        return '' + item.index
    }

    handleItemSelected = (item) => {
        this.onNavigate(item)
    }

    handleItemLongTap = (item) => {
        // do nothing.
    }

    render() {
        const { content } = this.props
        let albums = ((content !== null) ? Object.keys(content) : []).map((name, index) => ({index: index+1, name: name}))

        return (
            <FlatList 
                style={styles.container}
                data={albums}
                renderItem={this.renderItem}
                keyExtractor={this.keyExtractor}
            />
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
    itemContainer: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
    },
    status: {
        width: 60,
        textAlign: 'center',
        aspectRatio: 1,
        alignSelf: 'stretch',
        textAlignVertical: 'center',
        fontSize: 12,
        color: 'grey'
    },
    description: {
        flex: 1,
        flexDirection: 'column',
        marginRight: 10,
    },
    title: {        
        fontWeight: 'bold',
        fontSize: 16,
        color: 'black',     
    },
    subtitle: {
        fontSize: 14,
    },
})

