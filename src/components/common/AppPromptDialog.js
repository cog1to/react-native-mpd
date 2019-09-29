import React from 'react'
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
    Platform,
    Animated,
} from 'react-native'
import PropTypes from 'prop-types'

// Themes.
import ThemeManager from '../../themes/ThemeManager'

// Input.
import Input from './Input'

import KeyboardState from './KeyboardState'

class KeyboardAwareDialog extends React.Component {
    constructor(props) {
        super(props)
        this.inputOffset = new Animated.Value(0)
        this.state = {
            layout: null
        }
    }

    static propTypes = {
        // From `KeyboardState`
        screenY: PropTypes.number.isRequired,
        keyboardHeight: PropTypes.number.isRequired,
        keyboardVisible: PropTypes.bool.isRequired,
        keyboardWillShow: PropTypes.bool.isRequired,
        keyboardWillHide: PropTypes.bool.isRequired,
        keyboardAnimationDuration: PropTypes.number.isRequired,

        // Rendering content
        children: PropTypes.func,
    }

    static defaultProps = {
        children: null,
    }

    handleLayout = event => {
        const { nativeEvent: { layout } } = event

        if (this.state.layout == null) {
            this.setState({
                layout
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            keyboardHeight,
            keyboardVisible,
            keyboardAnimationDuration,
            keyboardWillShow,
            keyboardWillHide,
            screenY,
        } = nextProps

        const { layout } = this.state

        const shouldUpdateLayout = (Platform.OS === 'ios')
            ? (keyboardWillShow || keyboardWillHide)
            : (this.props.keyboardVisible != nextProps.keyboardVisible)

        if (layout != null && shouldUpdateLayout) {
            let animations = []
            
            const keyboardBecomingVisible = (Platform.OS === 'ios')
                ? keyboardWillShow
                : nextProps.keyboardVisible

            const headerOffset = Platform === 'ios' ? 60 : 64

            animations.push(Animated.timing(this.inputOffset, {
                toValue: keyboardBecomingVisible ? Math.min(0, -(layout.y + layout.height + headerOffset - screenY)) : 0,
                duration: keyboardAnimationDuration,
                useNativeDriver: true,
            }))

            Animated.parallel(animations).start()
        }
    }

    render() {
        const { children } = this.props
        const containerStyle = { transform: [{ translateY: this.inputOffset }] } 
        
        return (
            <Animated.View
                style={containerStyle}
                onLayout={this.handleLayout}
            >
                {children()}
            </Animated.View>
        )
    }

}

export default class AppDialog extends React.Component {
    static propTypes = {
        prompt: PropTypes.string.isRequired,
        placeholder: PropTypes.string.isRequired,
        cancelButton: PropTypes.shape({
            title: PropTypes.string.isRequired,
            onPress: PropTypes.func.isRequired,
        }).isRequired,
        confirmButton: PropTypes.shape({
            title: PropTypes.string.isRequired,
            onPress: PropTypes.func.isRequired,
        }).isRequired,
        knownItems: PropTypes.arrayOf(PropTypes.string),
    }

    static defaultProps = {
        knownItems: [],
    }

    state = {
        name: '',
    }

    handleConfirmPress = () => {
        const { name } = this.state
        const { confirmButton: { onPress } } = this.props
        onPress(name)
    }

    handleCancelPress = () => {
        const { cancelButton: { onPress } } = this.props
        onPress()
    }

    onChangeText = (text) => {
        this.setState({
            name: text,
        })
    }

    render() {
        const { prompt, cancelButton, confirmButton, placeholder, knownItems } = this.props
        const { name } = this.state
        const borderBottomColor = ThemeManager.instance().getCurrentTheme().accentColor

        const canConfirm = name.length > 0 && knownItems.find((item) => { return item == name }) == undefined

        return (
            <View style={styles.dimOverlay}>
                <KeyboardState>
                    {keyboardInfo => (
                        <KeyboardAwareDialog {...keyboardInfo}>
                            {() => (
                                <View style={styles.dialog}>
                                    <Text style={styles.promptText}>
                                        {prompt}
                                    </Text>
                                    <Input
                                        style={styles.promptInput}
                                        borderBottomColor={borderBottomColor}
                                        placeholder={placeholder}
                                        onChangeText={this.onChangeText}
                                        value={name}
                                        marginHorizontal={25}
                                        marginBottom={20}
                                    />
                                    {Platform.OS === 'ios' && (
                                        <View style={styles.buttonsContainerIOS}>
                                            {cancelButton && (
                                                <TouchableOpacity
                                                    onPress={this.handleCancelPress}
                                                    style={styles.cancelButton}>
                                                    <Text style={styles.buttonTextIOSCancel}>
                                                        {cancelButton.title}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity 
                                                disabled={!canConfirm}
                                                onPress={this.handleConfirmPress}
                                                style={{...styles.confirmButton, opacity: canConfirm ? 1 : 0.5}}>
                                                <Text style={styles.buttonTextIOS}>
                                                    {confirmButton.title}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    {Platform.OS === 'android' && (
                                        <View style={styles.buttonsContainerAndroid}>
                                            {cancelButton && (
                                                <TouchableOpacity
                                                    onPress={this.handleCancelPress}>
                                                    <Text style={styles.buttonText}>
                                                        {cancelButton.title.toUpperCase()}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity
                                                onPress={this.handleConfirmPress}
                                                disabled={!canConfirm}
                                                style={{opacity: canConfirm ? 1 : 0.5}}>
                                                <Text style={styles.buttonTextLast}>
                                                   {confirmButton.title.toUpperCase()}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            )}
                        </KeyboardAwareDialog>
                    )}
                </KeyboardState>
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
        minWidth: 300,
        backgroundColor: 'white',
        borderRadius: Platform.OS === 'ios' ? 12 : 0,
    },
    promptText: {
        margin: 25,
        marginBottom: 0,
        fontSize: Platform.OS == 'ios' 
            ? ThemeManager.instance().getCurrentTheme().subTextSize
            : ThemeManager.instance().getCurrentTheme().mainTextSize,
        color: ThemeManager.instance().getCurrentTheme().mainTextColor,
        textAlign: Platform.OS === 'ios' ? 'center' : 'left',
    },
    promptInput: {
        margin: 0,
        padding: 0,
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
