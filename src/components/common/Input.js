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
        placeholderColor: PropTypes.string,
        keyboardType: PropTypes.string,
        borderBottomColor: PropTypes.string,
        marginHorizontal: PropTypes.number,
        marginBottom: PropTypes.number,
    }

    static defaultProps = {
        keyboardType: 'default',
        value: '',
        placeholder: '',
        placeholderColor: ThemeManager.instance().getCurrentTheme().placeholderColor,
        borderBottomColor: ThemeManager.instance().getCurrentTheme().activeColor,
        marginHorizontal: 0,
        marginBottom: null
    }

    render() {
        const { borderBottomColor, marginHorizontal, marginBottom, placeholderColor } = this.props

        let style = {
            marginLeft: marginHorizontal,
            marginRight: marginHorizontal,
            flexDirection: 'row',
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: borderBottomColor,
            marginVertical: 5,
            marginBottom: marginBottom != null ? marginBottom : 5,
        }

        return (
            <View style={style}>
                <TextInput
                    {...this.props}
                    marginHorizontal={0}
                    marginBottom={0}
                    style={{...this.props.style, ...styles.textInput}}
                    underlineColorAndroid='transparent'
                    placeholderTextColor={placeholderColor}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    textInput: {
        height: 41,
        flex: 1,
        fontSize: 17
    }
})
