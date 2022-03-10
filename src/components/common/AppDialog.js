import React from 'react'
import {
	View,
	TouchableOpacity,
	StyleSheet,
	Text,
	Platform,
} from 'react-native'
import PropTypes from 'prop-types'

// Themes.
import ThemeManager from '../../themes/ThemeManager'

export default class AppDialog extends React.Component {
	static propTypes = {
        prompt: PropTypes.string.isRequired,
        cancelButton: PropTypes.shape({
        	title: PropTypes.string.isRequired,
        	onPress: PropTypes.func.isRequired,
        }),
        confirmButton: PropTypes.shape({
        	title: PropTypes.string.isRequired,
        	onPress: PropTypes.func.isRequired,
        }).isRequired,
    }

    static defaultProps = {
    	cancelButton: null,
    }

	render() {
		const { prompt, cancelButton, confirmButton, theme } = this.props

        const themeValue = ThemeManager.instance().getTheme(theme)
        const textColor = themeValue.mainTextColor
        const backgroundColor = themeValue.backgroundColor
        const dialogBackgroundColor = themeValue.dialogBackgroundColor
        const dialogSeparatorColor = themeValue.dialogSeparatorColor
        const buttonColor = themeValue.mainTextColor
        const activeColor = themeValue.accentColor
        const separator = theme.dialogSeparatorColor

		return (
			<View style={{...styles.dimOverlay, backgroundColor: dialogBackgroundColor}}>
                <View style={{...styles.dialog, backgroundColor: backgroundColor}}>
                    <Text style={{...styles.promptText, color: textColor}}>
                        {prompt}
                    </Text>
                    {Platform.OS === 'ios' && (
                        <View style={{...styles.buttonsContainerIOS, borderTopColor: dialogSeparatorColor, backgroundColor: activeColor}}>
                            {cancelButton && (
                            	<TouchableOpacity
                                    activeOpacity={0.5}
                                	onPress={cancelButton.onPress}
                                	style={{...styles.cancelButton, backgroundColor: backgroundColor}}>
                                	<Text style={{...styles.buttonTextIOSCancel, color: buttonColor}}>
                                   		{cancelButton.title}
                                	</Text>
                            	</TouchableOpacity>
                            )}
                            <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={confirmButton.onPress}
                                style={{...styles.confirmButton, borderLeftColor: dialogSeparatorColor, backgroundColor: backgroundColor, borderLeftWidth: 0.5}}>
                                <Text style={{...styles.buttonTextIOSCancel, color: buttonColor}}>
                                   {confirmButton.title}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {Platform.OS === 'android' && (
                        <View style={styles.buttonsContainerAndroid}>
                        	{cancelButton && (
                            	<TouchableOpacity onPress={cancelButton.onPress}>
                                	<Text style={{...styles.buttonText, color: buttonColor}}>
                                   		{cancelButton.title.toUpperCase()}
                                	</Text>
                            	</TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={confirmButton.onPress}>
                                <Text style={{...styles.buttonTextLast, color: buttonColor}}>
                                   {confirmButton.title.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
		)
	}
}

const styles = StyleSheet.create({
    dimOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialog: {
        paddingBottom: Platform.OS === 'ios' ? 0 : 15,
        margin: 20,
        backgroundColor: 'white',
        borderRadius: Platform.OS === 'ios' ? 12 : 0,
        overflow: 'hidden'
    },
    promptText: {
        margin: 25,
        fontSize: Platform.OS == 'ios' 
            ? ThemeManager.instance().getCurrentTheme().subTextSize
            : ThemeManager.instance().getCurrentTheme().mainTextSize,
        textAlign: Platform.OS === 'ios' ? 'center' : 'left',
    },
    buttonsContainerAndroid: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 5,
        paddingTop: 0,
    },
    buttonsContainerIOS: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    buttonTextLast: {
        fontWeight: 'bold',
        fontSize: 14,
        paddingLeft: 20,
        paddingRight: 20,
    },
    buttonTextIOS: {
        fontWeight: 'normal',
        fontSize: 17,
        padding: 12,
        paddingLeft: 20,
        paddingRight: 20,
    },
    buttonTextIOSCancel: {
        fontWeight: '500',
        fontSize: 17,
        padding: 12,
        paddingLeft: 20,
        paddingRight: 20,
    },
    cancelButton: {
    	alignItems:'center',
    	flexGrow: 1,
    	borderRightWidth: StyleSheet.hairlineWidth,
    },
    confirmButton: {
    	flexGrow: 1,
    	alignItems:'center',
    },
})
