import React from 'react'
import { 
    View, 
    StyleSheet,
    Button,
    Text,
    Image,
} from 'react-native'
import _ from 'lodash'

// Redux.
import { connect } from 'react-redux'

import SongProgress from '../components/SongProgress'
import Controls from '../components/Controls'
import AlbumArt from '../components/AlbumArt'
import CurrentSong from '../components/CurrentSong'
import VolumeControl from '../components/VolumeControl'

import { setVolume } from '../redux/reducers/player/actions'

class Player extends React.Component {
    constructor(props) {
        super(props)
        this.handleVolumeChangeThrottled = _.throttle(this.handleVolumeChange, 200)
    }

    state = {
        volumeVisible: false,
    }

    componentDidMount() {
        const { navigation } = this.props
        navigation.setParams({
            onVolumeToggle: this.onVolumeToggle,
        })
    }

    onVolumeToggle = () => {
        const { volumeVisible } = this.state

        this.setState({
            volumeVisible: !volumeVisible,
        })
    }

    handleVolumeChange = (newValue) => {
        const { setVolume } = this.props
        setVolume(newValue)
    }

    render() {
        const { volumeVisible } = this.state
        const { volume } = this.props

        return (
            <View style={styles.container}>
                <AlbumArt />
                <CurrentSong />
                <SongProgress />
                <Controls />
                {volumeVisible && (<VolumeControl volume={volume} onChange={this.handleVolumeChangeThrottled} />)}
            </View>
        )
    }

    getVolumeIcon = () => {
        const { volume } = this.props

        if (volume < 33) {
            return 'volume-mute'
        } else if (volume < 66) {
            return 'volume-down'
        } else {
            return 'volume-up'
        }
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
