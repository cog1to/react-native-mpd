import React from 'react'
import {
    View,
    ScrollView,
    Button,
    StyleSheet,
} from 'react-native'

import Input from '../components/common/Input'

export default class Search extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <ScrollView>
                    <Input placeholder="Title" />
                    <Input placeholder="Artist" />
                    <Input placeholder="Album" />
                    <Input placeholder="Album Artist" />
                    <Input placeholder="Filename" />
                    <Input placeholder="Year" />
                    <Input placeholder="Genre" />
                    <View style={styles.search}>
                        <Button title="Search" />
                    </View>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 5,
        paddingHorizontal: 20,
    },
    search: {
        marginTop: 10,
        alignSelf: 'flex-end',
    },
})

