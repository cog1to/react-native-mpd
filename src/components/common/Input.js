import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { PropTypes } from 'prop-types';
import { ViewPropTypes } from 'react-native';

// Themes.
import ThemeManager from '../../themes/ThemeManager'

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
        return (
            <View style={styles.inputContainer}>
                <TextInput
                    {...this.props}
                    style={{...this.props.style, ...styles.textInput}}
                    underlineColorAndroid='transparent'
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: ThemeManager.instance().getCurrentTheme().activeColor,
        marginVertical: 5
    },
    textInput: {
        height: 41,
        flex: 1,
    }
})
