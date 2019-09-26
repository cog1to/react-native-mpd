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
		const { prompt, cancelButton, confirmButton } = this.props

		return (
			<View style={styles.dimOverlay}>
                <View style={styles.dialog}>
                    <Text style={styles.promptText}>
                        {prompt}
                    </Text>
                    {Platform.OS === 'ios' && (
                        <View style={styles.buttonsContainerIOS}>
                            {cancelButton && (
                            	<TouchableOpacity
                                	onPress={cancelButton.onPress}
                                	style={styles.cancelButton}>
                                	<Text style={styles.buttonTextIOSCancel}>
                                   		{cancelButton.title}
                                	</Text>
                            	</TouchableOpacity>
                            )}
                            <TouchableOpacity 
                                onPress={confirmButton.onPress}
                                style={styles.confirmButton}>
                                <Text style={styles.buttonTextIOS}>
                                   {confirmButton.title}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {Platform.OS === 'android' && (
                        <View style={styles.buttonsContainerAndroid}>
                        	{cancelButton && (
                            	<TouchableOpacity onPress={cancelButton.onPress}>
                                	<Text style={styles.buttonText}>
                                   		{cancelButton.title.toUpperCase()}
                                	</Text>
                            	</TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={confirmButton.onPress}>
                                <Text style={styles.buttonTextLast}>
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
        backgroundColor: ThemeManager.instance().getCurrentTheme().dialogBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialog: {
        paddingBottom: Platform.OS === 'ios' ? 0 : 15,
        margin: 20,
        backgroundColor: 'white',
        borderRadius: Platform.OS === 'ios' ? 12 : 0,
    },
    promptText: {
        margin: 25,
        fontSize: Platform.OS == 'ios' 
            ? ThemeManager.instance().getCurrentTheme().subTextSize
            : ThemeManager.instance().getCurrentTheme().mainTextSize,
        color: ThemeManager.instance().getCurrentTheme().mainTextColor,
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
        borderTopColor: ThemeManager.instance().getCurrentTheme().dialogSeparatorColor,
    },
    buttonText: {
        color: ThemeManager.instance().getCurrentTheme().accentColor,
        fontWeight: 'bold',
        fontSize: 14,
    },
    buttonTextLast: {
        color: ThemeManager.instance().getCurrentTheme().accentColor,
        fontWeight: 'bold',
        fontSize: 14,
        paddingLeft: 20,
        paddingRight: 20,
    },
    buttonTextIOS: {
        color: ThemeManager.instance().getCurrentTheme().accentColor,
        fontWeight: 'normal',
        fontSize: 17,
        padding: 12,
        paddingLeft: 20,
        paddingRight: 20,
    },
    buttonTextIOSCancel: {
        color: ThemeManager.instance().getCurrentTheme().accentColor,
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
    	borderRightColor: ThemeManager.instance().getCurrentTheme().dialogSeparatorColor,
    },
    confirmButton: {
    	flexGrow: 1,
    	alignItems:'center',
    },
})
