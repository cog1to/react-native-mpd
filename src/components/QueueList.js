import React from 'react'
import PropTypes from 'prop-types'
import {
    View,
    StyleSheet,
    Text,
    FlatList,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native'
import { NavigationActions, StackActions } from 'react-navigation'

// Song prop types.
import { queuePropTypes } from '../redux/reducers/queue/reducer'

// Redux.
import { connect } from 'react-redux';

// Actions.
import { setCurrentSong, deleteSongs, clear }  from '../redux/reducers/queue/actions'
import { playPause } from '../redux/reducers/player/actions'
import { addToPlaylist } from '../redux/reducers/playlists/actions'

// List item.
import QueueListItem from './QueueListItem'

// Highlightable wrapper.
import { HighlightableView } from './common/HighlightableView'

// Item menu.
import MenuDialog from './common/MenuDialog'

// Themes.
import ThemeManager from '../themes/ThemeManager'

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RowAnimation = {
    duration: 250,
    create: { type: 'linear', property: 'scaleY' },
    update: { type: 'linear', property: 'scaleY' },
    delete: { type: 'linear', property: 'scaleY' }
}

const CustomLayoutAnimation = {
    duration: 200,
    create: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity,
    },
    update: {
        type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity,
    }
}

const HighlightableQueueListItem = HighlightableView(QueueListItem)

class QueueList extends React.Component {

    static ITEM_HEIGHT = 58

    state = {
        selected: [],
        editing: false,
        showingMenu: false,
    }

    static propTypes = {
        queue: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string.isRequired,
            subtitle: PropTypes.string,
            status: PropTypes.string,
            songId: PropTypes.string.isRequired,
        }))
    }

    static defaultProps = {
        queue: [],
    }

    render() {
        const { showingMenu } = this.state

        // Add to playlist option.
        options = [{ value: 'ADD_TO_PLAYLIST', title: 'To a playlist' }]

        return (
            <View style={styles.container}>
                <FlatList 
                    style={styles.list}
                    data={this.props.queue}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderItem}
                    extraData={this.state.selected}
                    getItemLayout={this.getItemLayout}
                />
                {showingMenu && (
                    <MenuDialog
                         title='Add items...'
                         options={options}
                         onHide={this.handleBackPress}
                         onOptionSelected={this.onOptionSelected}
                    />
                )}
 
            </View>

        )
    }

    keyExtractor = (item, index) => item.songId

    renderItem = ({item}) => {
        const { selected, editing } = this.state
        const { songId: id } = item
        const isSelected = (selected.find(el => { return el.id === id }) != null)

        return <QueueListItem
            item={{ id: item.songId, status: item.status, name: item.name, file: item.file }}
            selected={isSelected}
            subtitle={item.subtitle}
            onTap={this.onPressItem}
            onLongTap={this.onLongPressItem}
            onDeleteItem={this.onDeleteItem}
            onMenuPress={this.onMenuPress}
            height={QueueList.ITEM_HEIGHT}
            editing={editing}
        />
    }

    getItemLayout = (data, index) => ({
        length: QueueList.ITEM_HEIGHT,
        offset: index * QueueList.ITEM_HEIGHT,
        index,
    })

    onPressItem = ({ id, status, name, file }) => {
        const { editing, selected } = this.state
        const { navigation, queue } = this.props

        if (editing) {
            let newSelected = selected.slice()
            if (selected.find(el => { return el.id === id }) != null) {
                newSelected = selected.filter(el => { return el.id !== id })

                if (newSelected.length == 0) {
                    this.onCancelEditing()
                } else {
                    // First update own state.
                    this.setState({
                        selected: newSelected,
                    })

                    // Update navigation bar state.
                    navigation.setParams({
                        allSelected: newSelected.length === queue.length
                    })
                }
            } else {
                newSelected.push({ id, status, name, file })
                this.setState({
                    selected: newSelected,
                })
            }
            return
        }

        const { play, playPause } = this.props
        if (status === null) {
            play(id)
        } else if (status === 'play') {
            playPause('pause')
        } else {
            playPause('play')
        }
    }

    onLongPressItem = ({ id, status, name, file }) => {
        const { navigation, queue } = this.props
        const { editing, selected } = this.state
        
        let newSelected = selected.slice()
        if (selected.find(el => { return el.id === id }) != null) {
            newSelected = selected.filter(el => { return el.id !== id })
        } else {
            newSelected.push({ id, status, name, file })
        }

        LayoutAnimation.configureNext(CustomLayoutAnimation)

        // Update state.
        this.setState({
            editing: true,
            selected: newSelected,
        })

        // Update navigation bar state.
        navigation.setParams({
            editing: true,
            allSelected: newSelected.length === queue.length
        })
    }

    onDeleteItem = ({ id }) => {
        const { remove } = this.props
        const { selected } = this.state

        remove([id])
        
        this.setState({
            selected: selected.filter(item => { return item.id !== id })
        })
    }
    
    onCancelEditing = () => {
        const { navigation } = this.props
        navigation.setParams({ editing: false })

        const { selected } = this.state

        LayoutAnimation.configureNext(CustomLayoutAnimation)

        this.setState({
            selected: [],
            editing: false,
        })
    }

    onMenuPress = (item) => {
        const { editing, selected } = this.state

        let newSelected = selected.slice()
        newSelected.push(item)

        LayoutAnimation.configureNext(CustomLayoutAnimation)
        this.setState({
            showingMenu: true,
            selected: newSelected,
        })
    }

    handleBackPress = () => {
        const { showingMenu, selected, editing } = this.state

        if (showingMenu) {
            let newSelected = selected

            if (!editing) {
                newSelected = []
            }

            LayoutAnimation.configureNext(CustomLayoutAnimation)
            this.setState({
                showingMenu: false,
                selected: newSelected,
            })

            return true
        }

        if (editing) {
            this.onCancelEditing()
            return true
        }

        return false
    }

    onOptionSelected = (opt) => {
        const { addToQueue, queue, queueSize, position = null } = this.props

        const sorted = this.state.selected.slice()
        sorted.sort((one, two) => {
            return (one.id < two.id ? -1 : 1)
        })

        const paths = sorted.map(item => {
            return {
                path: item.file,
                type: 'FILE',
                data: null,
            }
        })

        switch (opt.value) {
            case 'ADD_TO_PLAYLIST': {
                this.navigateToPlaylists(paths)
                break
            }
        }
    }

    onNavigationButtonPressed = (icon) => {
        switch (icon) {
            case 'add':
                this.onConfirmAdd()
                break
            case 'delete':
                this.onConfirmDelete()
                break
        }
    }

    onConfirmDelete = () => {
        const { remove, navigation } = this.props
        const { selected } = this.state
        const ids = selected.map(item => { return item.id })

        navigation.setParams({
            editing: false,
        })

        this.setState({
            selected: [],
            editing: false,
        }, () => remove(ids))
    }

    onConfirmAdd = () => {
        this.onOptionSelected({value: 'ADD_TO_PLAYLIST'})
    }

    onGlobalSelectionToggled = (all) => {
        const { navigation, queue } = this.props

        if (all) {
            const items = queue.map((item, index) => {
                return {
                    name: item.name,
                    id: item.songId
                }
            })

            this.setState({
                selected: items,
            })

            // Update navigation bar state.
            navigation.setParams({
                allSelected: true,
            })
        } else {
            this.setState({
                selected: [],
            })

            // Update navigation bar state.
            navigation.setParams({
                allSelected: false,
            })
        }
    }

    componentDidMount() {
       this.props.navigation.setParams({
            onCancelEditing: this.onCancelEditing,
            onNavigationButtonPressed: this.onNavigationButtonPressed,
            onGlobalSelectionToggled: this.onGlobalSelectionToggled,
        })
    }
    
    // Playlists navigation.
    
    navigateToPlaylists = (paths) => {
        const { addToPlaylist, navigation } = this.props

        const action = NavigationActions.navigate({
            params: {
                callback: (name) => this.addToPlaylist(name, paths)
            },
            routeName: 'Playlists',
            key: 'selectPlaylist',
        })
        navigation.dispatch(action)
    }

    addToPlaylist = (name, paths) => {
        const { navigation, addToPlaylist } = this.props

        // Pop the stack.
        const popAction = StackActions.pop({ n: 1 })
        navigation.dispatch(popAction)

        // Close the menu.
        LayoutAnimation.configureNext(CustomLayoutAnimation, this.onCancelEditing)
        this.setState({
            editing: false,
            showingMenu: false,
            selected: [],
        })
        this.props.navigation.setParams({ editing: false })

        // Perform an action.
        addToPlaylist(name, paths)
    }
}

const queueToList = (state) => {
    const player = state.status.player
    const currentSongId = player === 'stop' ? null : state.currentSong.songId   

    return state.queue.map(song => {
        let name = song.title
        if (name === null) {
            name = song.file
        }

        let artist = song.artist
        if (artist == null) {
            artist = 'Unknown Artist'
        }

        return {
            songId: song.songId,
            file: song.file,
            name: name,
            subtitle: artist,
            status: (song.songId === currentSongId ? player : null)
        }
    })
}

const mapStateToProps = state => {
    return {
        queue: queueToList(state),
    }    
}

const mapDispatchToProps = dispatch => {
    return {
        play: (songId) => {
            dispatch(setCurrentSong(songId))
        },
        playPause: (state) => {
            dispatch(playPause(state))
        },
        remove: (songIds) => {
            dispatch(deleteSongs(songIds))
        },
        clear: () => {
            dispatch(clear())
        },
        addToPlaylist: (name, items) => {
            dispatch(addToPlaylist(name, items))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(QueueList)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})
