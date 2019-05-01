import React from 'react'
import { createStackNavigator, createBottomTabNavigator, createAppContainer } from 'react-navigation'
import FontAwesome, { Icons } from 'react-native-fontawesome'

import Login from './screens/Login'
import Player from './screens/Player'
import Queue from './screens/Queue'
import Browse from './screens/Browse'
import Search from './screens/Search'

const getTabBarIcon = icon => ({ tintColor }) => (
    <FontAwesome style={{ color: tintColor, fontSize: 20 }}>{Icons[icon]}</FontAwesome> 
)

const BrowseNavigator = createStackNavigator(
    {
        Browse: {
            screen: Browse,
            params: { name: 'Browse', dir: [''], },
            navigationOptions: ({ navigation }) => ({
                title: navigation.state.params.name,
                headerStyle: {
                    paddingTop: 24,
                    height: 56 + 24,
                }
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
            navigationOptions: ({ navigation }) => ({
                title: 'Queue',
                headerStyle: {
                    paddingTop: 24,
                    height: 56 + 24,
                }
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

const SearchNavigator = createStackNavigator(
    {
        Search: {
            screen: Search,
            navigationOptions: ({ navigation }) => ({
                title: 'Search',
                headerStyle: {
                    paddingTop: 24,
                    height: 56 + 24,
                }
            })
        }
    },
    {
        navigationOptions: {
            tabBarIcon: getTabBarIcon('search')
        }
    }
)

const TabNavigator = createBottomTabNavigator(
    {
        Browse: BrowseNavigator,
        Player: PlayerNavigator,
        Queue: QueueNavigator,
        Search: SearchNavigator,
    },
    {
        tabBarOptions: {
            showLabel: false,
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
