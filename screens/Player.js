import React from 'react'
import PropTypes from 'prop-types'
import { 
    View, 
    StyleSheet,
    Button,
    Text,
    Image,
} from 'react-native'

import MpdContext from '../utils/MpdContext'

import SongProgress from '../components/SongProgress'
import Controls from '../components/Controls'
import AlbumArt from '../components/AlbumArt'
import CurrentSong from '../components/CurrentSong'

export default class Player extends React.Component {    
    state = {
        state: null,
        currentSong: null,
    }

    static contextType = MpdContext

    /// List of all event listeners.
    disconnects = []

    componentDidMount() {
        const { client } = this.context
                
        this.disconnects.push(client.onPlayerUpdate(this.handleStatusUpdate))        
        this.handleStatusUpdate()
    }

    handleStatusUpdate = () => {
        this.updateCurrentSong()
        this.updateControls()
    }

    updateCurrentSong = () => {
        const { client } = this.context

        client.getCurrentSong((error, song) => {
            console.log(song)

            this.setState({
                currentSong: song
            })
        })
    }

    updateControls = () => {
        const { client } = this.context

        client.getStatus((error, status) => {
            const { state, duration, elapsed } = status

            this.setState({
                state: state,
                duration: parseFloat(duration),
                elapsed: parseFloat(elapsed),
            })
        })
    }

    componentWillUpdate(newProps, newState) {
        const newPlayerState = newState.state
        const oldPlayerState = this.state.state

        console.log(oldPlayerState, newPlayerState)

        if (oldPlayerState !== newPlayerState) {
            if (newPlayerState === 'play') {
                this.progressCallback = setInterval(this.updateControls, 1000)
            } else {
                clearInterval(this.progressCallback)
            }
        }
    }

    componentWillUnmount() {
        disconnects.forEach((element) => element())
    }

    render() {
        const { state, currentSong, duration, elapsed } = this.state
        
        return (
            <View style={styles.container}>
                <View style={styles.player}>
                    <AlbumArt />
                    <CurrentSong song={currentSong} />
                    <SongProgress 
                        style={styles.slider} 
                        state={state} 
                        duration={duration} 
                        elapsed={elapsed} />
                    <Controls
                        style={[styles.controls]}
                        state={state}
                        onNextSong={this.handleNextSong}
                        onPreviousSong={this.handlePreviousSong}
                        onPlayPause={this.handlePlayPause}                    
                    />                    
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    player: {
        flex: 1,
        justifyContent: 'space-around',
        flexGrow: 1,
        padding: 20,
    },
    albumArt: {        
        aspectRatio: 1,        
        flex: 1,
    },
    slider: {
        height: 50,
        alignSelf: 'stretch',
    },
    controls: {
        height: 50,
        alignSelf: 'stretch',
    }
})