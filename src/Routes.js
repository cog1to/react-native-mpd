import React from 'react'
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Platform,
  TextInput,
} from 'react-native'

import FontAwesome, { SolidIcons } from 'react-native-fontawesome'
import Icon from 'react-native-vector-icons/MaterialIcons'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome5'
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
import Outputs from './screens/Outputs'

import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTheme } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack';

import store from './redux/store'

// Selecting a stack implementation based on the platform. Android has layout
// issues with nativeStackNavigator that are breaking header view if keyboard
// was presented. I could not find any good solution to it except switching
// to React-Native own Stack navigator. Because of this issue Android has to
// fall back to Stack navigator.
const createNavigatorFactory = Platform.OS === 'android'
  ? createStackNavigator
  : createNativeStackNavigator

// Browse.
const BrowseStack = createNavigatorFactory()
function BrowseNavigator({ navigation, route }) {
  const { colors } = useTheme()

  return (
    <BrowseStack.Navigator>
      <BrowseStack.Screen 
        name="Browse"
        key={"Browse-"+route.params?.name ?? ""}
        component={Browse} 
        initialParams={{ name: 'Browse', dir: [''], allSelected: false }} 
        options={({route}) => ({
          headerShown: true,
          headerStyle: { backgroundColor: colors.navbar },
          title: route.params.name,
          headerTintColor: '#fff',
        })}
      />
      <BrowseStack.Screen 
        name="Playlists" 
        component={Playlists} 
        options={{
          headerShown: true,
          title: "",
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: colors.navbar },
        }}
      />
    </BrowseStack.Navigator>
  )
}

// Library.
const LibraryStack = createNavigatorFactory()
function LibraryNavigator() {
  const { colors } = useTheme()

  return (
    <LibraryStack.Navigator>
      <LibraryStack.Screen
        name="Library"
        key="Library"
        component={Library}
        initialParams={{ mode: store.getState().storage.mode }}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.navbar },
          headerTintColor: '#fff', title: "Library"
        }}
      />
      <LibraryStack.Screen
        name="Artist"
        key="Artist"
        component={Artist}
        initialParams={{
          mode: store.getState().storage.mode,
        }}
        options={({route}) => ({
          headerShown: true,
          headerStyle: { backgroundColor: colors.navbar },
          title: route.params.name,
          headerBackTitleVisible: false,
          headerTintColor: '#fff' 
        })} 
      />
      <LibraryStack.Screen
        name="Album"
        key="Album"
        component={Album}
        initialParams={{
          mode: store.getState().storage.mode
        }}
        options={({route}) => ({
          headerShown: true,
          headerStyle: { backgroundColor: colors.navbar },
          title: route.params.album,
          headerTintColor: '#fff'
        })} 
      />
      <LibraryStack.Screen 
        name="Playlists" 
        component={Playlists} 
        options={{
          headerShown: true,
          title: "",
          headerTintColor: '#fff',
          headerStyle: { backgroundColor: colors.navbar }
        }}
      />
    </LibraryStack.Navigator>
  )
}

// Queue.
const QueueStack = createNavigatorFactory()
function QueueNavigator() {
  const { colors } = useTheme()

  return (
    <QueueStack.Navigator>
      <QueueStack.Screen
        name="Queue"
        key="Queue"
        component={Queue} 
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.navbar },
          title: "Queue",
          headerTintColor: '#fff'
        }}
      />
      <QueueStack.Screen
        name="QueueSettings"
        key="QueueSettings"
        component={QueueSettings}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.navbar },
          title: "Settings",
          headerTintColor: '#fff'
        }}
      />
      <QueueStack.Screen
        name="Playlists"
        key="Playlists"
        component={Playlists}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.navbar },
          title: "",
          headerTintColor: '#fff'
        }}
      />
    </QueueStack.Navigator>
  )
}

// More.
const MoreStack = createNavigatorFactory()
function MoreNavigator() {
  const { colors } = useTheme()

  return (
    <MoreStack.Navigator>
      <MoreStack.Screen
        name="More"
        key="More"
        component={More}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.navbar },
          title: "More",
          headerTintColor: '#fff'
        }}
      />
      <MoreStack.Screen
        name="Search"
        key="Search"
        component={Search}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.navbar },
          title: "Search",
          headerTintColor: '#fff'
        }}
      />
      <MoreStack.Screen
        name="SearchResults"
        key="SearchResults"
        component={SearchResults}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.navbar },
          title: "Search Results",
          headerTintColor: '#fff'
        }}
      />
      <MoreStack.Screen
        name="Playlists"
        key="Playlists"
        component={Playlists}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.navbar },
          title: "Playlists",
          headerTintColor: '#fff'
        }}
      />
      <MoreStack.Screen
        name="Playlist"
        key="Playlist"
        component={Playlist}
        options={({route}) => ({
          headerShown: true,
          headerStyle: { backgroundColor: colors.navbar },
          title: route.params.name,
          headerTintColor: '#fff'
        })}
      />
      <MoreStack.Screen
        name="Outputs"
        key="Outputs"
        component={Outputs}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.navbar },
          title: "Outputs",
          headerTintColor: '#fff'
        }}
      />
    </MoreStack.Navigator>
  )
}

// Player stack
const PlayerStack = createNavigatorFactory()
function PlayerNavigator() {
  const { colors } = useTheme()

  return (
    <PlayerStack.Navigator>
      <PlayerStack.Screen
        name="Player"
        key="Player"
        component={Player}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.navbar },
          title: "Now Playing",
          headerTintColor: '#fff'
        }}
      />
    </PlayerStack.Navigator>
  )
}

// Tabs.
const Tab = createBottomTabNavigator();

function TabsNavigator() {
  const { colors } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarStyle: {
          backgroundColor: ThemeManager.instance().getCurrentTheme().toolbarColor
        },
        tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            let iconColor = focused
              ? color
              : ThemeManager.instance().getCurrentTheme().highlightColor

            if (route.name === 'TabBrowse') {
              iconName = 'folder-open'
            } else if (route.name === 'TabLibrary') {
              iconName = 'library-music'
              return <Icon name={iconName} size={24} color={iconColor} />
            } else if (route.name === 'TabPlayer') {
              iconName = 'play-circle'
            } else if (route.name === "TabQueue") {
              iconName = 'list-ul'
            } else if (route.name === "TabMore") {
              iconName = 'ellipsis-h'
            }

            return <FontAwesomeIcon
              name={iconName}
              size={20}
              color={iconColor}
              solid
            />
          }
      })}
    >
      <Tab.Screen 
        name="TabBrowse" 
        component={BrowseNavigator} 
        options={{ headerShown: false, tabBarShowLabel: false }}
      />
      <Tab.Screen 
        name="TabLibrary" 
        component={LibraryNavigator}
        options={{ headerShown: false, tabBarShowLabel: false }}
      />
      <Tab.Screen 
        name="TabPlayer" 
        component={PlayerNavigator} 
        options={{ headerShown: false, tabBarShowLabel: false }}
      />
      <Tab.Screen
        name="TabQueue"
        component={QueueNavigator}
        options={{ headerShown: false, tabBarShowLabel: false }}
      />
      <Tab.Screen
        name="TabMore"
        component={MoreNavigator}
        options={{ headerShown: false, tabBarShowLabel: false }}
      />
    </Tab.Navigator>
  );
}

// Login stack.
const Stack = createNativeStackNavigator();
function createMainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false, headerBackVisible:false }}
      />
      <Stack.Screen
        name="Home"
        component={TabsNavigator}
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}

export default createMainStack()
