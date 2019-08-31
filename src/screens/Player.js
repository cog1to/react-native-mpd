import React from 'react'
import { 
    View, 
    StyleSheet,
    Button,
    Text,
    Image,
    UIManager,
    Animated,
    Platform,
} from 'react-native'
import _ from 'lodash'

// Main screen features.
import MainScreen from './MainScreen'

// Redux.
import { connect } from 'react-redux'

// Sub-controls.
import SongProgress from '../components/SongProgress'
import Controls from '../components/Controls'
import AlbumArt from '../components/AlbumArt'
import CurrentSong from '../components/CurrentSong'
import VolumeControl, { VolumeBarHeight } from '../components/VolumeControl'

// Player actions.
import { setVolume } from '../redux/reducers/player/actions'

// Enable animations on Android.
if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

class Player extends MainScreen {    
    constructor(props) {
        super(props)

        this.handleVolumeChangeThrottled = _.throttle(this.handleVolumeChange, 200)

        // Contains last invoked animation.
        this.lastAnimation = null

        // Current animation type.
        this.slidingIn = false
    }

    state = {
        volumeSliderOffset: new Animated.Value(0),
    }

    componentDidMount() {
        const { navigation } = this.props

        super.componentDidMount()

        navigation.setParams({
            onVolumeToggle: this.onVolumeToggle,
        })
    }

    onVolumeToggle = () => {
        this.slidingIn = !this.slidingIn

        if (this.lastAnimation != null) {
            this.lastAnimation.stop()
        }

        this.lastAnimation = Animated.spring(this.state.volumeSliderOffset, {
            toValue: this.slidingIn ? 1 : 0,
            duration: 250,
        })

        this.lastAnimation.start(() => {
            this.lastAnimation = null
        })
    }

    handleVolumeChange = (newValue) => {
        const { setVolume, navigation } = this.props
        setVolume(newValue)
    }

    render() {
        const { volumeSliderOffset } = this.state
        const { volume } = this.props

        const volumeBarStyle = {
            flex: 1,
            position: 'absolute',
            left: 0,
            right: 0,
            elevation: 1,
            height: VolumeBarHeight,
            top: 0,
            transform: [{
                translateY: volumeSliderOffset.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-VolumeBarHeight, 0]
                })
            }]
        }

        return (
            <View style={styles.container}>
                <AlbumArt />
                <CurrentSong />
                <SongProgress />
                <Controls />
                <Animated.View style={volumeBarStyle}>
                    <VolumeControl volume={volume} onChange={this.handleVolumeChangeThrottled} />
                </Animated.View>
            </View>
        )
    }
}

const mapStateToProps = state => {
    const { volume } = state.status
    return { volume }
}

const mapDispatchToProps = dispatch => ({
    setVolume: (volume) => dispatch(setVolume(volume))
})

export default connect(mapStateToProps, mapDispatchToProps)(Player)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-evenly', 
        padding: 20,
    },
    
})
