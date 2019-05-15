import React from 'react'
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TouchableWithoutFeedback,
    StyleSheet,
    BackHandler,
    Platform,
    UIManager,
    LayoutAnimation,
} from 'react-native'

// Icons.
import FontAwesome, { Icons } from 'react-native-fontawesome'

// Vector icons.
import Icon from 'react-native-vector-icons/MaterialIcons'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { addToQueue, addToQueuePlay } from '../redux/reducers/browser/actions'

// Add menu.
import { OPTIONS, BrowseAddMenu } from './BrowseAddMenu'

// Highlightable list.
import HighlightableList from './common/HighlightableList'

// Enable animations on Android.
if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
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
}

class BrowseListItem extends React.Component {

    handleMenuPress = () => {
        const { item, onItemMenuSelected, select } = this.props
        select()
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
        const { item: { name, type, artist, title, fullPath, id }, playing, editing, selected } = this.props

        let displayName = title != null ? title : name
        let displayType = artist != null ? artist : type
        let menuOpacity = editing ? 0.0 : 1.0

        let icon = null
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

        return (
            <View style={styles.itemContainer}>
                <Text style={styles.status}>
                    {icon}
                </Text>
                <View style={styles.description}>
                    <Text style={styles.title}>{displayName}</Text>
                    <Text style={styles.subtitle}>{displayType}</Text>
                </View>
                <TouchableOpacity
                    onPress={this.handleMenuPress}
                    disabled={editing}>
                    {!editing && (
                        <Icon name='more-horiz' color='#000000' style={{...styles.status, fontSize: 20}} />
                    )}
                    {editing && selected && (
                        <Icon name='check' color='#000000' style={{...styles.status, fontSize: 20}} />
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

class ItemsList extends React.Component {
    
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
    }

    renderItem = ({ item }) => {
        const { file } = this.props
        const { editing } = this.state

        return (
            <BrowseListItem
                item={item}
                playing={item.fullPath === file}
                onItemMenuSelected={this.onItemMenuPress}
                editing={editing}
            />
        )
    }

    keyExtractor = (item) => {
        return item.fullPath
    }

    onItemPress = (item) => {
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
                    console.log('Deselecting ' + item.name)
                    console.log('New selected:\n' + JSON.stringify(newSelected))
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
            if (item.type === 'DIRECTORY') {
                this.props.onNavigate(item)
            } else {
                addToQueuePlay(item.fullPath, queueSize)
            }
        }
    }

    onItemLongPress = (item) => {
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
//                selected.forEach((item) => {
//                    if ('deselect' in item) {
//                        item.deselect()
//                    }
//                })
            }

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

    onOptionSelected = (option) => {
        const { addToQueue, content, queueSize, position = null } = this.props

        const sorted = this.state.selected.slice()
        sorted.sort((one, two) => {
            return (one.index < two.index ? -1 : 1)
        })

        const paths = sorted.map(item => {
            return {
                path: content[item.index].fullPath,
                type: content[item.index].type,
            }
        })

        switch (option) {
            case OPTIONS.ADD_TO_QUEUE_BEGINNING:
                addToQueue(paths, 0)
                break
            case OPTIONS.ADD_TO_QUEUE_END:
                addToQueue(paths, queueSize)
                break
            case OPTIONS.ADD_TO_QUEUE_AFTER_CURRENT_SONG:
                addToQueue(paths, position + 1)
                break
        }

//        this.state.selected.forEach(({ name, deselect }) => {
//            deselect()
//        })

        this.setState({
            showingMenu: false,
            selected: [],
        }, this.onCancelEditing)
    }

    onCancelEditing = () => {
        const { navigation } = this.props
        navigation.setParams({ editing: false })

        const { selected } = this.state
//        selected.forEach(({ name, deselect }) => {
//            deselect()
//        })

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
        const { queueSize = 0, position = null, content, file = null } = this.props
        
        // Populating options.
        const options = [OPTIONS.ADD_TO_QUEUE_BEGINNING]

        // If there's a current song, we can use at as an anchor.
        if (position !== null) {
            options.push(OPTIONS.ADD_TO_QUEUE_AFTER_CURRENT_SONG)
        }

        // If queue is not empty, we can add at the and as well as beginning.
        if (queueSize > 0) {
            options.push(OPTIONS.ADD_TO_QUEUE_END)
        }

        let enumerated = content.map((item, index) => {
            return {
                ...item,
                index: index,
            }
        })

        return (
            <View style={styles.container}>
                <HighlightableList
                    style={styles.list}
                    data={enumerated}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderItem}
                    onItemSelected={this.onItemPress}
                    onItemLongPress={this.onItemLongPress}
                    extraData={{file, editing, selected}}
                />
                {showingMenu && (
                    <View style={styles.menuWrapper}>
                        <TouchableWithoutFeedback onPress={this.handleBackPress}>
                            <View style={styles.menuContainer}>
                                <BrowseAddMenu 
                                    options={options}
                                    onOptionSelected={this.onOptionSelected}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
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
        fontWeight: 'bold',
        fontSize: 16,
        color: 'black',
    },
    subtitle: {
        fontSize: 14,
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

