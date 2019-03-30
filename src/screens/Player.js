import React from 'react'
import PropTypes from 'prop-types'
import { 
    View, 
    StyleSheet,
    Button,
    Text,
    Image,
} from 'react-native'

import SongProgress from '../components/SongProgress'
import Controls from '../components/Controls'
import AlbumArt from '../components/AlbumArt'
import CurrentSong from '../components/CurrentSong'

export default class Player extends React.Component {    
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.player}>
                    <AlbumArt />
                    <CurrentSong />
                    <SongProgress />
                    <Controls
                        style={[styles.controls]}
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
        justifyContent: 'space-evenly',
    },
    player: {
        flex: 1,
        justifyContent: 'space-evenly', 
        padding: 20,
    }
})