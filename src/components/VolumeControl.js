import React from 'react'
import {
    View,
    StyleSheet,
    Platform,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Slider from '@react-native-community/slider'

// Themes.
import ThemeManager from '../themes/ThemeManager'

// Volume bar height.
export const VolumeBarHeight = Platform.OS === 'android' ? 60 : 66

// Volume control.
export default class VolumeControl extends React.Component {

    state = { 
        dragging: false,
        currentValue: null,
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.dragging == false
    }

    handleValueChange = (newValue) => {
        const { onChange } = this.props

        onChange(newValue)
        this.setState({ dragging: true, currentValue: newValue })
    }

    onSlidingComplete = () => {
        this.setState({ dragging: false, currentValue: null })
    }

    render() {
        const { volume, onChange, theme } = this.props
        const { dragging, currentValue } = this.state

        const actualVolume = dragging ? currentValue : volume

        const themeValue = ThemeManager.instance().getTheme(theme)
        const backgroundColor = themeValue.toolbarColor

        return (
            <View style={{...styles.volumeBar, backgroundColor: backgroundColor}}>
                <Icon name='volume-mute' size={24} color={themeValue.mainTextColor} style={styles.volumeIcon} />
                <Slider 
                    style={styles.slider}
                    value={actualVolume}
                    minimumValue={0} 
                    maximumValue={100}
                    step={1}
                    onValueChange={this.handleValueChange}
                    onSlidingComplete={this.onSlidingComplete}
                    minimumTrackTintColor={themeValue.activeColor}
                    thumbTintColor={themeValue.accentColor}
                />
                <Icon name='volume-up' size={24} color={themeValue.mainTextColor} style={styles.volumeIcon} />
            </View>
        )
    }

}

const styles = StyleSheet.create({
    volumeBar: {
        flex: 1,
        flexDirection: 'row',
        position: 'absolute',
        top: 0,
        padding: 16,
        paddingVertical: Platform.OS === 'android' ? 16 : 8,
        left: 0,
        right: 0,
        elevation: 1,
        alignItems: 'center',
    },
    volumeIcon: {
        paddingHorizontal: 4,
        width: 30,
    },
    slider: {
        flexGrow: 1
    }
})
