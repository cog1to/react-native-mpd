import React from 'react'
import {
    View,
    StyleSheet,
} from 'react-native'
import { NavigationActions } from 'react-navigation'

// Main screen features.
import MainScreen from './MainScreen'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { changeCurrentDir } from '../redux/reducers/browser/actions'

// Items list.
import ItemsList from '../components/ItemsList'

class Browse extends MainScreen {
    static defaultProps = {
        content: [],
        refreshing: false,
    }

    onNavigate = (item) => {
        const { navigation } = this.props
        const { state: { params: { dir } } } = navigation

        const newDir = dir.slice()
        newDir.push(item.name)

        const action = NavigationActions.navigate({
            params: {
                name: item.name,
                dir: newDir,
            },
            routeName: 'Browse',
            key: 'Browse' + newDir,
        })
        navigation.dispatch(action)
    }

    componentDidMount() {
        super.componentDidMount()
        this.reload()
    }

    reload = () => {
        const { navigation, loadCurrentDir } = this.props
        const { state: { params: { dir } } } = navigation
        loadCurrentDir(dir, true)
    }

    render() {
        const { content, navigation, refreshing } = this.props
        const { state: { params } } = navigation

        return (
            <View style={styles.container}>
                <ItemsList
                    content={content}
                    onNavigate={this.onNavigate}
                    navigation={navigation}
                    onReload={this.reload}
                    refreshing={refreshing}
                />
            </View>
        )
    }
}

const nodeFromPath = (path, tree) => {
    let node = tree
    
    if (node === null) {
        return null
    }

    path.length > 1 && path.slice(1).forEach((element) => {
        node = node.children.filter((child) => child.name === element)[0]
    })

    return node
}

const mapStateToProps = (state, ownProps) => {
    const { navigation: { state: { params: { dir = [''] } } } } = ownProps
    const { tree, refreshing } = state.browser

    let content = tree != null ? nodeFromPath(dir, tree).children : []

    return {
        ...ownProps,
        content: content,
        refreshing: refreshing,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        loadCurrentDir: (path, force = false) => {
            dispatch(changeCurrentDir(path, force))
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Browse)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

