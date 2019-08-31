import React from 'react'
import {
    View,
    Slider,
    StyleSheet,
    Platform,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

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
        const { volume, onChange } = this.props
        const { dragging, currentValue } = this.state

        const actualVolume = dragging ? currentValue : volume

        const theme = ThemeManager.instance().getCurrentTheme()

        return (
            <View style={styles.volumeBar}>
                <Icon name='volume-mute' size={24} color={theme.mainTextColor} style={styles.volumeIcon} />
                <Slider 
                    style={styles.slider}
                    value={actualVolume}
                    minimumValue={0} 
                    maximumValue={100}
                    step={1}
                    onValueChange={this.handleValueChange}
                    onSlidingComplete={this.onSlidingComplete}
                    minimumTrackTintColor={theme.activeColor}
                    thumbTintColor={theme.accentColor}
                />
                <Icon name='volume-up' size={24} color={theme.mainTextColor} style={styles.volumeIcon} />
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
        backgroundColor: ThemeManager.instance().getCurrentTheme().toolbarColor,
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
