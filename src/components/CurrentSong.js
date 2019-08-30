import React from 'react'
import PropTypes from 'prop-types'
import { 
    View, 
    StyleSheet,
    Text,
} from 'react-native'

// Redux.
import { connect } from 'react-redux';

class CurrentSong extends React.Component {
    render() {
        const { currentSong, state } = this.props
        if (!currentSong) return null

        const { title, album, artist, file } = currentSong              

        // Construct the title.
        let actualTitle = title
        if (!actualTitle) {
            actualTitle = file
        }
        if (!actualTitle) {
            actualTitle = '---'
        }

        if (state === 'stop') {
            return (
                <View style={styles.container}>
                    <Text style={styles.songName}>Player is stopped</Text>
                </View>
            )
        } else {
            return (
                <View style={styles.container}>                                 
                    <Text style={styles.songName} numberOfLines={1}>{actualTitle}</Text>
                    {artist && (<Text numberOfLines={1} style={styles.albumName}>{artist} - {album ? album : '[Unknown album]'}</Text>)}
                    {!artist && (<Text numberOfLines={1} style={styles.albumName}>---</Text>)}
                </View>
            )
        }
    }
}

const mapStateToProps = state => {
    let currentSong = state.currentSong
    return {
        currentSong: currentSong,
        state: state.status.player,
    }
}

export default connect(mapStateToProps, null)(CurrentSong)

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'center',
        marginVertical: 10,
    },
    songName: {
        fontWeight: 'bold',
        fontSize: 20,
        color: 'black',
        textAlign: 'center',
    },
    albumName: {
        fontSize: 16,
        textAlign: 'center',
    },
})
