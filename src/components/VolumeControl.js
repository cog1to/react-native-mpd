import React from 'react'
import {
    View,
    Slider,
    StyleSheet,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

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

        return (
            <View style={styles.volumeBar}>
                <Icon name='volume-mute' size={24} color='#000000' />
                <Slider 
                    style={styles.slider}
                    value={actualVolume}
                    minimumValue={0} 
                    maximumValue={100}
                    step={1}
                    onValueChange={this.handleValueChange}
                    onSlidingComplete={this.onSlidingComplete}
                />
                <Icon name='volume-up' size={24} color='#000000' />
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
        backgroundColor: 'white',
        left: 0,
        right: 0,
        elevation: 1,
    },
    slider: {
        flexGrow: 1
    }
})
