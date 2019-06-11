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

// Highlightable view wrapper.
import { HighlightableView } from '../components/common/HighlightableView'

class ArtistView extends React.PureComponent {
    render() {
        const { index, name } = this.props.item

        return (
            <View style={styles.itemContainer}>
                <Text style={styles.status}>
                    {index}
                </Text>
                <View style={styles.description}>
                    <Text style={styles.title} ellipsizeMode='tail' selectable={false} numberOfLines={1}>{name}</Text>
                    <Text style={styles.subtitle}>Artist</Text>
               </View>
            </View>
        )
    }
}

const HighlightableArtistView = HighlightableView(ArtistView)

class Library extends React.Component {
    componentDidMount() {
        const { content, loadArtists } = this.props

        if (content === null) {
            loadArtists()
        }
    }

    renderItem = ({item}) => {
        return (
            <HighlightableArtistView 
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
        let artists = ((content !== null) ? Object.keys(content) : []).map((name, index) => ({index: index+1, name: name}))

        return (
            <FlatList 
                style={styles.container}
                data={artists}
                renderItem={this.renderItem}
                keyExtractor={this.keyExtractor}
            />
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

