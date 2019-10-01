import React from 'react'
import {
    TouchableOpacity,
    StyleSheet,
    Text,
    View,
    Platform,
} from 'react-native'
import {
    createStackNavigator,
    createBottomTabNavigator,
    createAppContainer,
} from 'react-navigation'
import FontAwesome, { Icons } from 'react-native-fontawesome'
import Icon from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import ThemeManager from './themes/ThemeManager'

import Login from './screens/Login'
import Player from './screens/Player'
import Queue from './screens/Queue'
import QueueSettings from './screens/QueueSettings'
import Browse from './screens/Browse'
import Search from './screens/Search'
import SearchResults from './screens/SearchResults'
import Library from './screens/Library'
import Artist from './screens/Artist'
import Album from './screens/Album'
import More from './screens/More'
import Playlists from './screens/Playlists'
import Playlist from './screens/Playlist'

const iconColor = ThemeManager.instance().getCurrentTheme().navigationBarIconColor
const textColor = ThemeManager.instance().getCurrentTheme().navigationBarTextColor

const navigationHeader = {
    headerStyle: {
        paddingTop: Platform.OS === 'android' ? 24 : 12,
        height: Platform.OS === 'android' ? 56 + 24 : 40,
        backgroundColor: ThemeManager.instance().getCurrentTheme().accentColor,
    },
    headerTitleStyle: {
        color: ThemeManager.instance().getCurrentTheme().navigationBarIconColor
    },
    headerTintColor: ThemeManager.instance().getCurrentTheme().navigationBarIconColor,
}

const getTabBarIcon = icon => ({ tintColor }) => (
    <FontAwesome style={{ color: tintColor, fontSize: 20 }}>{Icons[icon]}</FontAwesome> 
)

const getMaterialTabBarIcon = icon => ({ tintColor }) => (
    <Icon name={icon} size={24} color={tintColor} /> 
)

const barOptionsFromState = ({ title, navigation, icons = ['add'], hideTitle = false, regularIcon }) => {
    let options = {
        title: hideTitle && navigation.getParam('editing') === true ? null : title,
        ...navigationHeader
    }

    const allSelected = navigation.getParam('allSelected')
    let globalSelectionIcon = allSelected ? 'checkbox-multiple-blank-outline' : 'checkbox-multiple-marked-outline'

    if (navigation.getParam('editing') === true) {
        options.headerLeft = (
            <TouchableOpacity
                onPress={navigation.getParam('onCancelEditing')}
                style={styles.headerLeftButton}
            >
                <Icon
                    name='clear'
                    size={24}
                    color={ThemeManager.instance().getCurrentTheme().navigationBarIconColor}
                /> 
            </TouchableOpacity>
        )

        let buttons = icons.map((icon) => {
            return (
                <TouchableOpacity 
                    key={icon}
                    onPress={() => navigation.getParam('onNavigationButtonPressed')(icon)}
                    style={styles.headerButton}>
                    <Icon name={icon}
                        size={24}
                        color={ThemeManager.instance().getCurrentTheme().navigationBarIconColor}
                    />
                </TouchableOpacity>
            )
        })

        options.headerRight = (
            <View style={styles.rightEditingHeader}>
                <TouchableOpacity
                    onPress={() => navigation.getParam('onGlobalSelectionToggled')(!allSelected)}
                    style={styles.headerButton}
                >
                    <MaterialCommunityIcon
                        name={globalSelectionIcon}
                        size={24}
                        color={ThemeManager.instance().getCurrentTheme().navigationBarIconColor}
                    />
                </TouchableOpacity>
                {buttons}
            </View>
        )
    } else {
        if (regularIcon != null) {
            options.headerRight = (
                <View style={styles.rightEditingHeader}>
                    <TouchableOpacity onPress={navigation.getParam('onMenu')} style={styles.headerButton}>
                        <Icon
                            name={regularIcon}
                            size={24}
                            color={ThemeManager.instance().getCurrentTheme().navigationBarIconColor}
                        />
                    </TouchableOpacity>
                </View>
            )
        }
    }

    return options
}

const BrowseNavigator = createStackNavigator(
    {
        Browse: {
            screen: Browse,
            params: { name: null, dir: [''], allSelected: false, },
            navigationOptions: ({ navigation }) => barOptionsFromState({
                title: navigation.state.params.name == null ? 'Browse' : navigation.state.params.name,
                navigation: navigation,
                hideTitle: true,
                regularIcon: null,
            })
        },
        Playlists: {
            screen: Playlists,
            params: { callback: null },
            navigationOptions: ({ navigation }) => barOptionsFromState({
                title: 'Playlists',
                navigation: navigation,
                hideTitle: true,
                icons: (navigation.state.params.callback != null) ? [] : ['add', 'delete'],
                regularIcon: (navigation.state.params.callback != null) ? 'add' : null,
            })
        }
    },
    {
        navigationOptions: {
            tabBarIcon: getTabBarIcon('folderOpen'),
        },
        defaultNavigationOptions: navigationHeader,
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
                icons: ['add', 'delete'],
                regularIcon: 'settings',
            })
        },
        QueueSettings: {
            screen: QueueSettings,
            navigationOptions: {
                title: 'Settings',
            }
        },
        Playlists: {
            screen: Playlists,
            params: { callback: null },
            navigationOptions: ({ navigation }) => barOptionsFromState({
                title: 'Playlists',
                navigation: navigation,
                hideTitle: true,
                icons: (navigation.state.params.callback != null) ? [] : ['add', 'delete'],
                regularIcon: (navigation.state.params.callback != null) ? 'add' : null,
            })
        }
    },
    {
        navigationOptions: {
            tabBarIcon: getTabBarIcon('listUl'),
        },
        defaultNavigationOptions: navigationHeader,
    }
)

const PlayerNavigator = createStackNavigator(
    {
        Player: {
            screen: Player,
            navigationOptions: ({ navigation }) => ({
                ...navigationHeader,
                title: 'Now Playing',
                headerRight: (
                    <TouchableOpacity onPress={navigation.getParam('onVolumeToggle')} style={styles.headerButton}>
                        <Icon 
                            name='volume-down'
                            size={24}
                            color={ThemeManager.instance().getCurrentTheme().navigationBarIconColor}
                        />
                    </TouchableOpacity>
                ),
            }),
        }
    },
    {
        navigationOptions: {
            tabBarIcon: getTabBarIcon('playCircle'),
        },
        defaultNavigationOptions: navigationHeader,
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

const MoreNavigator = createStackNavigator(
    {
        More: {
            screen: More,
            navigationOptions: ({ navigation }) => ({
                title: 'More',
            })
        },
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
        },
        Playlists: {
            screen: Playlists,
            params: { callback: null },
            navigationOptions: ({ navigation }) => barOptionsFromState({
                title: 'Playlists',
                navigation: navigation,
                hideTitle: true,
                icons: (navigation.state.params.callback != null) ? [] : ['add', 'delete'],
                regularIcon: (navigation.state.params.callback != null) ? 'add' : null,
            })
        },
        Playlist: {
            screen: Playlist,
            params: { name: null, allSelected: false, },
            navigationOptions: ({ navigation }) => barOptionsFromState({
                title: navigation.state.params.name,
                navigation: navigation,
                hideTitle: true,
                regularIcon: null,
            })
        }
    },
    {
        navigationOptions: {
            tabBarIcon: getTabBarIcon('ellipsis-h'),
        },
        defaultNavigationOptions: navigationHeader,
    }

)

const LibraryNavigator = createStackNavigator(
    {
        Library: {
            screen: Library,
            navigationOptions: ({ navigation }) => barOptionsFromState({
                title: 'Library',
                navigation: navigation,
            }),
        },
        Artist: {
            screen: Artist,
            navigationOptions: ({ navigation }) => barOptionsFromState({
                title: navigation.getParam('name'),
                navigation: navigation,
            }),
        },
        Album: {
            screen: Album,
            navigationOptions: ({ navigation }) => barOptionsFromState({
                title: navigation.getParam('artist') + ' - ' + navigation.getParam('album'),
                navigation: navigation,
                hideTitle: true,
            })
        },
        Playlists: {
            screen: Playlists,
            params: { callback: null },
            navigationOptions: ({ navigation }) => barOptionsFromState({
                title: 'Playlists',
                navigation: navigation,
                hideTitle: true,
                icons: (navigation.state.params.callback != null) ? [] : ['add', 'delete'],
                regularIcon: (navigation.state.params.callback != null) ? 'add' : null,
            })
        }
    },
    {
        navigationOptions: {
            tabBarIcon: getMaterialTabBarIcon('library-music')
        },
        defaultNavigationOptions: navigationHeader,
    }
)

const TabNavigator = createBottomTabNavigator(
    {
        Browse: BrowseNavigator,
        Library: LibraryNavigator,
        Player: PlayerNavigator,
        Queue: QueueNavigator,
        More: MoreNavigator,
    },
    {
        tabBarOptions: {
            showLabel: false,
            style: {
                elevation: 20,
                backgroundColor: ThemeManager.instance().getCurrentTheme().toolbarColor,
            },
            activeTintColor: ThemeManager.instance().getCurrentTheme().accentColor,
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
        aspectRatio: 0.7,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerLeftButton: {
        flexDirection: 'row',
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
        marginRight: 10,
    },
    headerTextButton: {
        color: ThemeManager.instance().getCurrentTheme().navigationBarTextColor,
        fontWeight: 'bold',
        fontSize: 18,
    }
})
