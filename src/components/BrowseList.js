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
import { changeCurrentDir } from '../redux/reducers/browser/actions'

// Add menu.
import BrowseAddMenu from './BrowseAddMenu'

import Highlightable from './common/Highlightable'

// Highlightable list.
import HighlightableList from './common/HighlightableList'

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

class BrowseListItem extends React.PureComponent {

    handlePress = () => {
        const { item, onItemSelected } = this.props
        onItemSelected(item)
    }

    handleMenuPress = () => {
        const { item, onItemMenuSelected } = this.props
        onItemMenuSelected(item)
    }

    render() {
        const { item: { name, type, artist, title } } = this.props

        let displayName = title != null ? title : name
        let displayType = artist != null ? artist : type

        return (
            <Highlightable
                onPress={this.handlePress}
            >
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
            </Highlightable>
        )
    }
}

class BrowseList extends React.Component {
    
    state = {
        showingMenu: false,
    }

    static defaultProps = {
        currentDir: [''],
        content: [],
    }

    renderItem = ({item}) => {
        return (
            <BrowseListItem
                item={item}
                onItemSelected={this.onItemPress}
                onItemMenuSelected={this.onItemMenuPress}
            />
        )
    }

    keyExtractor = (item) => {
        return item.name
    }

    onItemPress = (item) => {
        const { currentDir, loadCurrentDir } = this.props
        
        if (item.type === 'DIRECTORY') {
            let newDir = currentDir.slice()
            newDir.push(item.name)

            this.props.loadCurrentDir(newDir)
        } else {
            this.setState({
                showingMenu: true,
            })
        }
    }

    onItemMenuPress = (item) => {
        // TODO: Add to queue.
    }

    handleBackPress = () => {
        const { currentDir, loadCurrentDir } = this.props
        if (currentDir.length > 1) {
            loadCurrentDir(currentDir.slice(0, currentDir.length-1))
            return true
        }

        return false
    }

    componentDidMount() {
        this.props.loadCurrentDir([''])
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
        }
    }

    componentWillReceiveProps = (nextProps) => {
        if (this.flatList && nextProps.currentDir.length != this.props.currentDir) {
            this.flatList.scrollToOffset({ offset: 0, animated: false })
        }
    }

    render() {
        const { showingMenu } = this.state

        return (
            <View style={styles.container}>
                <FlatList
                    ref={(component) => {this.flatList = component}}
                    style={styles.list}
                    data={this.props.content}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderItem}
                />
                {showingMenu && (
                    <View style={styles.menuWrapper}>
                        <TouchableWithoutFeedback>
                            <View style={styles.menuContainer}>
                                <BrowseAddMenu />
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

const mapStateToProps = state => {
    const { tree, currentDir } = state.browser

    let content = nodeFromPath(currentDir, tree)    

    return {
        currentDir: state.browser.currentDir,
        content: (content === null ? [] : (content.children !== null ? content.children : [])),
    }
}

const mapDispatchToProps = dispatch => {
    return {
        loadCurrentDir: (path) => {
            dispatch(changeCurrentDir(path))
        },
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

