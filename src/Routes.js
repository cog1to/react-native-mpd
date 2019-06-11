import React from 'react'
import {
    TouchableOpacity,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import {
    createStackNavigator,
    createBottomTabNavigator,
    createAppContainer,
} from 'react-navigation'
import FontAwesome, { Icons } from 'react-native-fontawesome'
import Icon from 'react-native-vector-icons/MaterialIcons'

import Login from './screens/Login'
import Player from './screens/Player'
import Queue from './screens/Queue'
import Browse from './screens/Browse'
import Search from './screens/Search'
import SearchResults from './screens/SearchResults'
import Library from './screens/Library'
import Artist from './screens/Artist'
import Album from './screens/Album'

const getTabBarIcon = icon => ({ tintColor }) => (
    <FontAwesome style={{ color: tintColor, fontSize: 20 }}>{Icons[icon]}</FontAwesome> 
)

const getMaterialTabBarIcon = icon => ({ tintColor }) => (
    <Icon name={icon} size={24} color={tintColor} /> 
)

const barOptionsFromState = ({ title, navigation, icon = 'add', hideTitle = false }) => {
    let options = {
        title: hideTitle && navigation.getParam('editing') === true ? null : title,
        headerStyle: {
            paddingTop: 24,
            height: 56 + 24,
        }
    }

    const allSelected = navigation.getParam('allSelected')
    let globalSelectionText = allSelected ? 'DESELECT ALL' : 'SELECT ALL'

    if (navigation.getParam('editing') === true) {
        options.headerLeft = (
            <TouchableOpacity onPress={navigation.getParam('onCancelEditing')} style={styles.headerButton}>
                <Icon name='clear' size={24} color='#000000' /> 
            </TouchableOpacity>
        )
        options.headerRight = (
            <View style={styles.rightEditingHeader}>
                <TouchableOpacity onPress={() => navigation.getParam('onGlobalSelectionToggled')(!allSelected)}>
                    <Text style={styles.headerTextButton}>{globalSelectionText}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={navigation.getParam('onConfirmEditing')} style={styles.headerButton}>
                    <Icon name={icon} size={24} color='#000000' /> 
                </TouchableOpacity>
            </View>
        )
    }

    return options
}

const BrowseNavigator = createStackNavigator(
    {
        Browse: {
            screen: Browse,
            params: { name: 'Browse', dir: [''], allSelected: false, },
            navigationOptions: ({ navigation }) => barOptionsFromState({
                title: navigation.state.params.name,
                navigation: navigation,
            })
        }
    },
    {
        navigationOptions: {
            tabBarIcon: getTabBarIcon('folderOpen')
        }
    }
)

const QueueNavigator = createStackNavigator(
    {
        Queue: {
            screen: Queue,
            params: { allSelected: false, },
            navigationOptions: ({ navigation }) => barOptionsFromState({
                title: 'Queue',
                navigation: navigation,
                icon: 'delete',
            })
        }
    },
    {
        navigationOptions: {
            tabBarIcon: getTabBarIcon('listUl')
        }
    }
)

const PlayerNavigator = createStackNavigator(
    {
        Player: {
            screen: Player,
            navigationOptions: ({ navigation }) => ({
                title: 'Now Playing',
                headerStyle: {
                    paddingTop: 24,
                    height: 56 + 24,
                }
            })
        }
    },
    {
        navigationOptions: {
            tabBarIcon: getTabBarIcon('playCircle')
        }
    }
)

const searchResultsTitleFromLength = (length) => {
    let prefix = 'Found ' + length

    if (length == 1) {
        prefix += ' track'
    } else {
        prefix += ' tracks'
    }

    return prefix
}

const SearchNavigator = createStackNavigator(
    {
        Search: {
            screen: Search,
            navigationOptions: ({ navigation }) => ({
                title: 'Search',
           })
        },
        SearchResults: {
            screen: SearchResults,
            params: { content: [], allSelected: false, },
            navigationOptions: ({ navigation }) => barOptionsFromState({
                title: searchResultsTitleFromLength(navigation.state.params.content.length),
                navigation: navigation,
            })
        }
    },
    {
        navigationOptions: {
            tabBarIcon: getTabBarIcon('search'),
             
        },
        defaultNavigationOptions: {
            headerStyle: {
                paddingTop: 24,
                height: 56 + 24,
            },
        }
    }
)

const LibraryNavigator = createStackNavigator(
    {
        Library: {
            screen: Library,
            navigationOptions: ({ navigation }) => ({
                title: 'Library',
           }),
        },
        Artist: {
            screen: Artist,
            navigationOptions: ({ navigation }) => ({
                title: 'Artist: ' + navigation.getParam('name')
            })
        },
        Album: {
            screen: Album,
            navigationOptions: ({ navigation }) => barOptionsFromState({
                title: navigation.getParam('artist') + ' - ' + navigation.getParam('album'),
                navigation: navigation,
                hideTitle: true,
            })
        }
    },
    {
        navigationOptions: {
            tabBarIcon: getMaterialTabBarIcon('library-music')
        },
        defaultNavigationOptions: {
            headerStyle: {
                paddingTop: 24,
                height: 56 + 24,
            },
        }
    }
)

const TabNavigator = createBottomTabNavigator(
    {
        Browse: BrowseNavigator,
        Library: LibraryNavigator,
        Player: PlayerNavigator,
        Queue: QueueNavigator,
        Search: SearchNavigator,
    },
    {
        tabBarOptions: {
            showLabel: false,
            style: {
                elevation: 20,
            }
        }
    }
)

const AppNavigator = createStackNavigator({
    Login: {
        screen: Login,
        navigationOptions: {
            header: null,
        }
    },
    Home: {
        screen: TabNavigator,
        navigationOptions: {
            header: null,
        }
    }
})

export default createAppContainer(AppNavigator)

const styles = StyleSheet.create({
    headerButton: {
        height: '100%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
    },
    rightEditingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTextButton: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 18,
    }
})
