import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { PropTypes } from 'prop-types';
import { ViewPropTypes } from 'react-native';

export default class Input extends React.Component {
    static propTypes = {
        onChangeText: PropTypes.func.isRequired,
        value: PropTypes.string,
        placeholder: PropTypes.string,
        keyboardType: PropTypes.string
    }

    static defaultProps = {
        keyboardType: 'default',
        value: '',
        placeholder: ''
    }

    render() {
        const { onChangeText, value, placeholder, keyboardType } = this.props;
    
        return (
            <View style={styles.inputContainer}>
                <TextInput 
                    style={styles.textInput}
                    value={value}
                    placeholder={placeholder}
                    onChangeText={onChangeText}
                    underlineColorAndroid='transparent'
                    keyboardType={keyboardType} 
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginVertical: 5
    },
    textInput: {
        height: 40,
        flex: 1,
    }
})
