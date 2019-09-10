import React from 'react'
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    BackHandler,
    Platform,
    UIManager,
    LayoutAnimation,
    Animated,
    TouchableWithoutFeedback,
} from 'react-native'
import PropTypes from 'prop-types'

// Icons.
import FontAwesome, { Icons } from 'react-native-fontawesome'

// Vector icons.
import Icon from 'react-native-vector-icons/MaterialIcons'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { addToQueue, addToQueuePlay } from '../redux/reducers/browser/actions'

// Highlightable view wrapper.
import { HighlightableView } from './common/HighlightableView'

// Theme manager.
import ThemeManager from '../themes/ThemeManager'

// On-screen list menu/dialog.
import MenuDialog from './common/MenuDialog'

// Enable animations on Android.
if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CustomLayoutAnimation = {
    duration: 250,
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

const OPTIONS = { 
    ADD_TO_QUEUE_BEGINNING: { value: 'ADD_TO_QUEUE_BEGINNING', title: 'At the beginning of queue' },
    ADD_TO_QUEUE_END: { value: 'ADD_TO_QUEUE_END', title: 'At the end of queue' },
    ADD_TO_QUEUE_AFTER_CURRENT_SONG: { value: 'ADD_TO_QUEUE_AFTER_CURRENT_SONG', title: 'After current song' },
}

class BrowseListItem extends React.Component {

    handleMenuPress = () => {
        const { item, onItemMenuSelected } = this.props
        onItemMenuSelected(item)
    }

    shouldComponentUpdate(nextProps) {
        const { item: nextItem, playing: nextPlaying, editing: nextEditing, selected: nextSelected } = nextProps
        const { item, playing, editing, selected } = this.props

        return item.name != nextItem.name
            || item.type != nextItem.type
            || item.artist != nextItem.artist
            || item.title != nextItem.title
            || playing != nextPlaying
            || editing != nextEditing
            || selected != nextSelected
    }

    render() {
        const { item, playing, editing, selected } = this.props
        const { name, type, artist, title, fullPath, id, index } = item

        let displayName = title != null ? title : name
        let displayType = artist != null ? artist : type
        let menuOpacity = editing ? 0.0 : 1.0

        let icon = item.icon
        switch (type) {
            case 'FILE':
                if (playing) {
                    icon = <FontAwesome>{Icons.play}</FontAwesome>
                } else if (id != null) {
                    icon = "" + id
                } else {
                    icon = <FontAwesome>{Icons.music}</FontAwesome>
                }
                break
            case 'DIRECTORY':
                icon = <FontAwesome>{Icons.folder}</FontAwesome>
                break
            case 'PLAYLIST':
                icon = <FontAwesome>{Icons.fileAlt}</FontAwesome>
                break
        }

        const theme = ThemeManager.instance().getCurrentTheme()

        let iconColor = playing 
            ? theme.activeColor
            : theme.lightTextColor

        let titleStyle = playing
            ? styles.titlePlaying
            : styles.title

        return (
            <View style={styles.itemContainer}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{...styles.status, color: iconColor}}>
                        {icon}
                    </Text>
                </View>
                <View style={styles.description}>
                    <Text style={titleStyle} numberOfLines={1} ellipsizeMode='tail'>{displayName}</Text>
                    <Text style={styles.subtitle}>{displayType}</Text>
                </View>
                <TouchableOpacity
                    onPress={this.handleMenuPress}
                    disabled={editing}>
                    {!editing && (
                        <Icon name='more-vert' color={theme.mainTextColor} style={{...styles.status, fontSize: 20}} />
                    )}
                    {editing && selected && (
                        <Icon name='check' color={theme.mainTextColor} style={{...styles.status, fontSize: 20}} />
                    )}
                    {editing && !selected && 
                        // Placeholder view to keep the text layout the same.
                        (<View style={{width: 60, height: '100%'}} />)
                    }
                </TouchableOpacity>
            </View>
        )
    }
}

const HighlightableBrowseListItem = HighlightableView(BrowseListItem)

class ItemsList extends React.Component {
    
    static ITEM_HEIGHT = 58

    state = {
        showingMenu: false,
        selected: [],
        editing: false,
    }

    static defaultProps = {
        content: [],
        queueSize: 0,
        position: null,
        onNavigate: () => {},
        onReload: null,
        refreshing: false,
    }

    // Rendering.

    renderItem = ({ item }) => {
        const { file } = this.props
        const { editing, selected } = this.state
        const key = this.keyExtractor(item)
        const isSelected = (selected.find((el) => { return el.name == item.name }) != null)

        return (
            <HighlightableBrowseListItem
                item={item}
                playing={item.fullPath === file}
                onItemMenuSelected={this.onItemMenuPress}
                onTap={this.onItemTap}
                onLongTap={this.onItemLongTap}
                editing={editing}
                selected={isSelected}
                height={ItemsList.ITEM_HEIGHT}
            />
        )
    }

    keyExtractor = (item) => {
        return item.fullPath
    }

    getItemLayout = (data, index) => ({
        length: ItemsList.ITEM_HEIGHT,
        offset: index * ItemsList.ITEM_HEIGHT,
        index,
    })

    // Events.

    onItemTap = (item) => {
        const { addToQueuePlay, queueSize, navigation, content } = this.props
        const { editing, selected } = this.state
        
        if (this.state.editing) {            
            let newSelected = selected.slice()

            if (selected.find(({ name }) => { return name === item.name }) != null) {
                newSelected = selected.filter(({ name }) => { return name != item.name })
                if (newSelected.length == 0) {
                    this.onCancelEditing()
                } else {
                    // First update own state.
                    this.setState({
                        selected: newSelected,
                    })

                    // Update navigation bar state.
                    navigation.setParams({
                        allSelected: newSelected.length === content.length
                    })
                }
            } else {
                newSelected.push({ name: item.name, index: item.index })

                // First update own state.
                this.setState({
                    selected: newSelected,
                })

                // Update navigation bar state.
                navigation.setParams({
                    allSelected: newSelected.length === content.length
                })
            }
        } else {
            if (item.type === 'FILE') {
                addToQueuePlay(item.fullPath, queueSize)
            } else if (item.type !== 'PLAYLIST') {
                this.props.onNavigate(item)
            }
        }
    }

    onItemLongTap = (item) => {
        const { navigation, content } = this.props

        LayoutAnimation.configureNext(CustomLayoutAnimation)

        let newSelected = this.state.selected.slice()
        newSelected.push({ name: item.name, index: item.index })
        
        // Update own state.
        this.setState({
            editing: true,
            selected: newSelected,
        })

        // Update navigation bar state.
        navigation.setParams({
            editing: true,
            allSelected: newSelected.length === content.length
        })
    }

    onItemMenuPress = (item) => {
        const { editing, selected } = this.state

        // When in editing mode, ignore menu presses.
        if (editing) {
            return
        }

        let newSelected = selected.slice()
        newSelected.push({name: item.name, index: item.index })

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
        const { addToQueue, content, queueSize, position = null } = this.props

        const sorted = this.state.selected.slice()
        sorted.sort((one, two) => {
            return (one.index < two.index ? -1 : 1)
        })

        const paths = sorted.map(item => {
            return {
                path: content[item.index].fullPath,
                type: content[item.index].type,
                data: content[item.index].data,
            }
        })

        switch (opt.value) {
            case OPTIONS.ADD_TO_QUEUE_BEGINNING.value:
                addToQueue(paths, 0)
                break
            case OPTIONS.ADD_TO_QUEUE_END.value:
                addToQueue(paths, queueSize)
                break
            case OPTIONS.ADD_TO_QUEUE_AFTER_CURRENT_SONG.value:
                addToQueue(paths, position + 1)
                break
        }

        LayoutAnimation.configureNext(CustomLayoutAnimation, this.onCancelEditing)
        this.setState({
            showingMenu: false,
            selected: [],
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

    onConfirmEditing = () => {
        this.setState({
            showingMenu: true,
        })
    }

    onGlobalSelectionToggled = (all) => {
        const { navigation, content } = this.props

        if (all) {
            const items = content.map((item, index) => {
                return {
                    name: item.name,
                    index: index,
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

    // Layout.

    componentDidMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
        }

        this.props.navigation.setParams({
            onCancelEditing: this.onCancelEditing,
            onConfirmEditing: this.onConfirmEditing,
            onGlobalSelectionToggled: this.onGlobalSelectionToggled,
        })
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
        }
    }

    render() {
        const { showingMenu, selected, editing } = this.state
        const { queueSize = 0, position = null, content, file = null, refreshing, onReload } = this.props
        
        // Populating options.
        const options = [OPTIONS.ADD_TO_QUEUE_BEGINNING]

        // If there's a current song, we can use at as an anchor.
        if (position !== null) {
            options.push(OPTIONS.ADD_TO_QUEUE_AFTER_CURRENT_SONG)
        }

        // If queue is not empty, we can add at the and as well as the beginning.
        if (queueSize > 0) {
            options.push(OPTIONS.ADD_TO_QUEUE_END)
        }

        // Add index value to each item.
        let enumerated = content.map((item, index) => {
            return {
                ...item,
                index,
            }
        })

        // Pull-to-refresh is enabled when we provide onRefresh prop to the flatlist
        // To prevent adding refresh control that does nothing, we check if we actually
        // have onReload prop provided.
        let refreshingProps = {}
        if (onReload !== null) {
            refreshingProps = {
                onRefresh: onReload,
                refreshing,
            }
        }

        return (
            <View style={styles.container}>
                <FlatList
                    style={styles.list}
                    data={enumerated}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderItem}
                    extraData={{file, editing, selected}}
                    getItemLayout={this.getItemLayout}
                    {...refreshingProps}
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
}

const mapStateToProps = (state, ownProps) => {
    const { position = null, file = null } = state.currentSong
    const { player } = state.status

    let queueSize = state.queue.length

    let { content } = ownProps

    let contentWithIds = content.map(item => {
        const found = state.queue.find(el => {
            return el.file === item.fullPath
        })

        return {
            ...item,
            id: (found != null ? found.songId : null),
        }
    })

    return {
        ...ownProps,
        content: contentWithIds,
        file: file,
        queueSize: queueSize,
        position: player !== 'stop' ? position : null,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addToQueue: (uri, position, type) => {
            dispatch(addToQueue(uri, position, type))
        },
        addToQueuePlay: (uri, position) => {
            dispatch(addToQueuePlay(uri, position))
        }
   }
}


export default connect(mapStateToProps, mapDispatchToProps)(ItemsList)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    list: {
        flex: 1,
    },
    itemContainer: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    status: {
        width: 60,
        textAlign: 'center',
        alignSelf: 'stretch',
        textAlignVertical: 'center',
        fontSize: 12,
    },
    description: {
        flex: 1,
        flexDirection: 'column',
        marginRight: 10,
    },
    title: {
        fontWeight: Platform.OS === 'android' ? 'normal' : '500',
        fontSize: ThemeManager.instance().getCurrentTheme().mainTextSize,
        color: ThemeManager.instance().getCurrentTheme().mainTextColor,
        marginBottom: Platform.OS === 'android' ? 0 : 2,
    },
    titlePlaying: {
        fontWeight: 'bold',
        fontSize: ThemeManager.instance().getCurrentTheme().mainTextSize,
        color: ThemeManager.instance().getCurrentTheme().mainTextColor,
        marginBottom: Platform.OS === 'android' ? 0 : 2,
    },
    subtitle: {
        fontSize: 13,
        color: ThemeManager.instance().getCurrentTheme().lightTextColor,
    },
    menuWrapper: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    menuContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
})

