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
} from 'react-native'

// Icons.
import FontAwesome, { Icons } from 'react-native-fontawesome'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { changeCurrentDir, addToQueue } from '../redux/reducers/browser/actions'

// Add menu.
import { OPTIONS, BrowseAddMenu } from './BrowseAddMenu'

// Highlightable list.
import HighlightableList from './common/HighlightableList'

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

class BrowseListItem extends React.PureComponent {

    handleMenuPress = () => {
        const { item, onItemMenuSelected } = this.props
        onItemMenuSelected(item)
    }

    render() {
        const { item: { name, type, artist, title } } = this.props

        let displayName = title != null ? title : name
        let displayType = artist != null ? artist : type

        return (
                <View style={styles.itemContainer}>
                    <Text style={styles.status}>
                        {type === 'FILE' && (<FontAwesome>{Icons.music}</FontAwesome>) }
                        {type === 'DIRECTORY' && (<FontAwesome>{Icons.folder}</FontAwesome>) }
                        {type === 'PLAYLIST' && (<FontAwesome>{Icons.fileAlt}</FontAwesome>) }
                    </Text>
                    <View style={styles.description}>
                        <Text style={styles.title}>{displayName}</Text>
                        <Text style={styles.subtitle}>{displayType}</Text>
                    </View>
                    {type === 'DIRECTORY' && (
                        <TouchableOpacity
                            onPress={this.handleMenuPress}
                        >
                            <Text style={{...styles.status, fontSize: 14, fontWeight: 'bold'}}>
                                ...
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
        )
    }
}

class BrowseList extends React.Component {
    
    state = {
        showingMenu: false,
        selected: []
    }

    static defaultProps = {
        dir: [''],
        content: [],
        queueSize: 0,
        position: null,
    }

    renderItem = ({item}) => {
        return (
            <BrowseListItem
                item={item}
                onItemMenuSelected={this.onItemMenuPress}
            />
        )
    }

    keyExtractor = (item) => {
        return item.name
    }

    onItemPress = (item, deselect) => {
        const { dir, loadCurrentDir } = this.props
        
        if (item.type === 'DIRECTORY') {
            let newDir = dir.slice()
            newDir.push(item.name)
            
            //this.props.loadCurrentDir(newDir)
            this.props.onNavigate(newDir)
            
            deselect()
        } else {
            let newSelected = this.state.selected.slice()
            newSelected.push({name: item.name, deselect: deselect})

            this.setState({
                showingMenu: true,
                selected: newSelected,
            })
        }
    }

    onItemMenuPress = (item) => {
        let newSelected = this.state.selected.slice()
        newSelected.push({name: item.name})

        this.setState({
            showingMenu: true,
            selected: newSelected,
        })
    }

    handleBackPress = () => {
        const { dir, loadCurrentDir } = this.props
        const { showingMenu, selected } = this.state

        if (showingMenu) {
            selected.forEach((item) => {
                if ('deselect' in item) {
                    item.deselect()
                }
            })

            this.setState({
                showingMenu: false,
                selected: [],
            })

            return true
        }

        return false
    }

    onOptionSelected = (option) => {
        const { addToQueue, content, queueSize, position = null } = this.props
        const { name, deselect = null } = this.state.selected[0]

        const item = content.filter(el => {
            return el.name === name
        })[0]

        switch (option) {
            case OPTIONS.ADD_TO_QUEUE_BEGINNING:
                addToQueue(item.fullPath, 0, item.type)
                break
            case OPTIONS.ADD_TO_QUEUE_END:
                addToQueue(item.fullPath, queueSize, item.type)
                break
            case OPTIONS.ADD_TO_QUEUE_AFTER_CURRENT_SONG:
                addToQueue(item.fullPath, position + 1, item.type)
                break
        }

        if (deselect) {
            deselect()
        }

        this.setState({
            showingMenu: false,
            selected: [],
        })
    }

    componentDidMount() {
        const { dir, loadCurrentDir } = this.props

        loadCurrentDir(dir)
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
        }
    }

    render() {
        const { showingMenu, selected } = this.state
        const { queueSize = 0, position = null, content } = this.props
        
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

        return (
            <View style={styles.container}>
                <HighlightableList
                    style={styles.list}
                    data={content}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderItem}
                    onItemSelected={this.onItemPress}
                />
                {showingMenu && (
                    <View style={styles.menuWrapper}>
                        <TouchableWithoutFeedback>
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

const nodeFromPath = (path, tree) => {
    let node = tree
    
    if (node === null) {
        return null
    }

    path.slice(1).forEach((element) => {
        node = node.children.filter((child) => child.name === element)[0]
    })

    return node
}

const mapStateToProps = (state, ownProps) => {
    const { dir } = ownProps
    const { tree } = state.browser
    const { position = null } = state.currentSong
    const { player } = state.status

    let content = tree != null ? nodeFromPath(dir, tree).children : []
    let queueSize = state.queue.length

    return {
        content: content,
        queueSize: queueSize,
        position: player !== 'stop' ? position : null,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        loadCurrentDir: (path) => {
            dispatch(changeCurrentDir(path))
        },
        addToQueue: (uri, position, type) => {
            console.log('dispatching')
            dispatch(addToQueue(uri, position, type))
        }
   }
}


export default connect(mapStateToProps, mapDispatchToProps)(BrowseList)

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

