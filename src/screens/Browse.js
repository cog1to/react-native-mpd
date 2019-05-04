import React from 'react'
import {
    View,
    StyleSheet,
} from 'react-native'
import { NavigationActions } from 'react-navigation'

import BrowseList from '../components/BrowseList'

export default class Browse extends React.Component {
    
    onNavigate = (dir) => {
        const { navigation } = this.props

        const action = NavigationActions.navigate({
            params: {
                name: dir[dir.length-1],
                dir: dir,
            },
            routeName: 'Browse',
            key: 'Browse' + dir,
        })
        navigation.dispatch(action)
    }

    render() {
        const { navigation: { state: { params } } } = this.props
        const { dir } = params

        return (
            <View style={styles.container}>
                <BrowseList dir={dir} onNavigate={this.onNavigate} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

