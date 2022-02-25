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

// Keyboard state listener.
import KeyboardState from './KeyboardState'

// Keyboard aware view.
import KeyboardAwareView from './KeyboardAwareView'

// Redux.
import { connect } from 'react-redux'

class AppPromptDialog extends React.Component {
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
    const { prompt, cancelButton, confirmButton, placeholder, knownItems, theme } = this.props
    const { name } = this.state
    
    const borderBottomColor = theme.dialogSeparatorColor
    const dialogBackgroundColor = theme.dialogBackgroundColor
    const backgroundColor = theme.backgroundColor
    const mainTextColor = theme.mainTextColor
    const buttonTextColor = theme.searchButtonColor
    const separator = theme.dialogSeparatorColor
    const disabledColor = theme.disabledColor
    const activeColor = theme.accentColor

    const canConfirm = name.length > 0 && knownItems.find((item) => { return item == name }) == undefined

    const topOffset = Platform.OS === 'ios' ? 60 : 70

    return (
      <View style={{...styles.dimOverlay, backgroundColor: dialogBackgroundColor}}>
        <KeyboardState>
          {keyboardInfo => (
            <KeyboardAwareView topOffset={topOffset} {...keyboardInfo}>
              {() => (
                <View style={{...styles.dialog, backgroundColor: backgroundColor}}>
                  <Text style={{...styles.promptText, color: mainTextColor}}>
                    {prompt}
                  </Text>
                  <Input
                    style={styles.promptInput}
                    borderBottomColor={borderBottomColor}
                    placeholder={placeholder}
                    onChangeText={this.onChangeText}
                    value={name}
                    textColor={mainTextColor}
                    marginHorizontal={25}
                    marginBottom={20}
                  />
                  {Platform.OS === 'ios' && (
                    <View style={{...styles.buttonsContainerIOS, borderTopColor: separator, backgroundColor: activeColor}}>
                      {cancelButton && (
                        <TouchableOpacity
                          activeOpacity={0.5}
                          onPress={this.handleCancelPress}
                          style={{...styles.cancelButton, borderRightColor: separator, backgroundColor: backgroundColor}}>
                          <Text style={{...styles.buttonTextIOSCancel, color: mainTextColor}}>
                            {cancelButton.title}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        disabled={!canConfirm}
                        activeOpacity={0.5}
                        onPress={this.handleConfirmPress}
                        style={{...styles.confirmButton, backgroundColor: (canConfirm ? backgroundColor : disabledColor)}}>
                        <Text style={{...styles.buttonTextIOSCancel, color: (canConfirm ? mainTextColor: buttonTextColor)}}>
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
                          <Text style={{...styles.buttonText, color: buttonTextColor}}>
                            {cancelButton.title.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={this.handleConfirmPress}
                        disabled={!canConfirm}
                        style={{opacity: canConfirm ? 1 : 0.5}}>
                        <Text style={{...styles.buttonTextLast, color: buttonTextColor}}>
                          {confirmButton.title.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </KeyboardAwareView>
          )}
        </KeyboardState>
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
    const theme = state.storage.theme
    const themeValue = ThemeManager.instance().getTheme(theme)
    return { ...ownProps, theme: themeValue }
}

export default connect(mapStateToProps, null)(AppPromptDialog)

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
    minWidth: 300,
    borderRadius: Platform.OS === 'ios' ? 12 : 0,
    overflow: 'hidden'
  },
  promptText: {
    margin: 25,
    marginBottom: 0,
    fontSize: Platform.OS == 'ios'
      ? ThemeManager.instance().getCurrentTheme().subTextSize
      : ThemeManager.instance().getCurrentTheme().mainTextSize,
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
