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
        keyboardType: PropTypes.string,
        borderBottomColor: PropTypes.string,
    }

    static defaultProps = {
        keyboardType: 'default',
        value: '',
        placeholder: '',
        borderBottomColor: ThemeManager.instance().getCurrentTheme().activeColor,
    }

    render() {
        const { borderBottomColor } = this.props

        let style = {
            flexDirection: 'row',
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: borderBottomColor,
            marginVertical: 5
        }

        return (
            <View style={style}>
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
