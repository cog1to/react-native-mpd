import React from 'react'
import {
    View,
    Text,
    FlatList,
    TouchableHighlight,
    StyleSheet,
    BackHandler,
    Platform,
} from 'react-native'

export default class BrowseAddMenu extends React.Component {
    
    static defaultProps = {
        count: null
    }

    render() {
        const { count } = this.props
        const addText = count === null ? 'Add items' : 'Add ' + count + ' items'

        return (
                <View style={styles.container}>
                    <Text style={styles.header}>{addText}</Text>
                    <TouchableHighlight>
                        <Text style={styles.option}>
                            At the beginning of queue
                        </Text>
                    </TouchableHighlight>
                    <TouchableHighlight>
                        <Text style={styles.option}>
                            At the end of queue
                        </Text>
                    </TouchableHighlight>
                    <TouchableHighlight>
                        <Text style={styles.option}>
                            After current song
                        </Text>
                    </TouchableHighlight>
                </View>
        )
    }
}

const styles = StyleSheet.create({
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        margin: 15,
        marginBottom: 20,
        textAlign: 'center',
    },
    option: {
        color: 'black',
        fontSize: 16,
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    container: {
        backgroundColor: 'white',
        shadowColor: 'black',
        shadowRadius: 10,
        shadowOpacity: 0.5,
        elevation: 10, 
    }
})
