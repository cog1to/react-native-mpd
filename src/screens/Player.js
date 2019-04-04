import React from 'react'
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
                <AlbumArt />
                <CurrentSong />
                <SongProgress />
                <Controls />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-evenly', 
        padding: 20,
    }
})