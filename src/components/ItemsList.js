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
    Animated,
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

// Add menu.
import { OPTIONS, BrowseAddMenu } from './BrowseAddMenu'

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

const HighlightableView = (WrappedComponent) => {
    return class extends React.Component {

        state = {
            pressed: false,
            selected: false,
        }

        constructor(props) {
            super(props)
            this.animatedValue = new Animated.Value(0)
            this.animating = false
        }

        static propTypes = {
            highlightColor: PropTypes.string.isRequired,
            duration: PropTypes.number.isRequired,
            onTap: PropTypes.func.isRequired,
            onLongTap: PropTypes.func.isRequired,
        }

        static defaultProps = {
            highlightColor: '#00000033',
            duration: 200,
        }
        
        // State manipulation.
        
        deselect = () => {
            this.setState({
                pressed: false,
            })
        }

        select = () => {
            this.setState({
                pressed: true,
            })
        }

        // Animations.
        
        componentWillUpdate(nextProps, nextState) {
            if (nextState.pressed || nextProps.selected) {
                this.animatedValue.setValue(1)
            } else {
                this.animateBackground(0)
            }
        }

        onAnimationEnded = (endValue) => {
            if ((this.state.pressed || this.props.selected) && endValue == 0) {
                this.animateBackground(1)
            } else if (!(this.state.pressed || this.props.selected) && endValue == 1) {
                this.animateBackground(0)
            } else {
                this.animating = false
            }
        }
        
        animateBackground = (endValue) => {
            const { duration } = this.props
            
            this.animating = true
            Animated.timing(
                this.animatedValue,
                {
                    toValue: endValue,
                    duration: duration/2,
                }
            ).start(() => this.onAnimationEnded(endValue))
        }

        // Touch events.

        handlePressIn = () => {
            this.select()
        }

        handlePressOut = () => {
            this.deselect()
        }

        handlePress = () => {
            const { onTap, item } = this.props
            onTap(item)
        }

        handleLongPress = () => {
            const { onLongTap, item } = this.props
            onLongTap(item)
        }

        // Rendering.

        render() {
            const { highlightColor } = this.props
            
            const opacity = this.animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1]
            })

            const highlightViewStyle = {
                backgroundColor: highlightColor,
                opacity: opacity,
                position: 'absolute',
                width: '100%',
                height: '100%',
                zIndex: -1,
            }

            return (
                <TouchableWithoutFeedback
                    onPressIn={this.handlePressIn}
                    onPressOut={this.handlePressOut}
                    onPress={this.handlePress}
                    onLongPress={this.handleLongPress}>
                    <View>
                        <WrappedComponent {...this.props} />
                        <Animated.View style={highlightViewStyle} />
                    </View>
                </TouchableWithoutFeedback>
            )
        }
    }
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

const HighlightableBrowseListItem = HighlightableView(BrowseListItem)

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
            />
        )
    }

    keyExtractor = (item) => {
        return item.fullPath
    }

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
            if (item.type === 'DIRECTORY') {
                this.props.onNavigate(item)
            } else {
                addToQueuePlay(item.fullPath, queueSize)
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

        this.setState({
            showingMenu: false,
            selected: [],
        }, this.onCancelEditing)
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
                <FlatList
                    style={styles.list}
                    data={enumerated}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderItem}
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

