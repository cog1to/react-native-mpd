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

import PropTypes from 'prop-types'

export const OPTIONS = {
    ADD_TO_QUEUE_BEGINNING: 'ADD_TO_QUEUE_BEGINNING',
    ADD_TO_QUEUE_END: 'ADD_TO_QUEUE_END',
    ADD_TO_QUEUE_AFTER_CURRENT_SONG: 'ADD_TO_QUEUE_AFTER_CURRENT_SONG',
}

const OPTION_TEXT = {
    'ADD_TO_QUEUE_BEGINNING': 'At the beginning of queue',
    'ADD_TO_QUEUE_END': 'At the end of queue',
    'ADD_TO_QUEUE_AFTER_CURRENT_SONG': 'After current song',
}

export class BrowseAddMenu extends React.Component {
    
    static propTypes = {
        count: PropTypes.number,
        onOptionSelected: PropTypes.func.isRequired,
        options: PropTypes.array.isRequired,
    }

    static defaultProps = {
        count: null,
    }

    handleOnPress = (option) => {
        this.props.onOptionSelected(option)
    }

    render() {
        const { count, options } = this.props
        const addText = count === null ? 'Add items...' : 'Add ' + count + ' items'

        return (
                <View style={styles.container}>
                    <Text style={styles.header}>{addText}</Text>
                    {options.map(opt => {
                        return (
                            <TouchableHighlight key={opt} onPress={() => this.handleOnPress(opt)}>
                                <Text style={styles.option}>
                                    {OPTION_TEXT[opt]}
                                </Text>
                            </TouchableHighlight>
                         ) 
                    })}
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
