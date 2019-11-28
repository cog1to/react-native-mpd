import React from 'react'
import PropTypes from 'prop-types'
import { 
    View, 
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome5'

// Redux.
import { connect } from 'react-redux';

// Actions.
import { playPause, playNext, playPrevious } from '../redux/reducers/player/actions'

class Controls extends React.Component {
    static defaultProps = {
        state: 'stop',
    }
    
    playPause = () => {
        const { onPlayPause, state } = this.props
        
        if (state === 'play') {
            onPlayPause('pause')
        } else {
            onPlayPause('play')
        }
    }

    previous = () => {
        const { onPrevious } = this.props
        onPrevious()
    }

    next = () => {
        const { onNext } = this.props
        onNext()
    }

    render() {
        let { state } = this.props

        const disabled = state === 'stop'
        const color = disabled ? 'lightgray' : 'black'

        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={this.previous} disabled={disabled}>
                    <View style={styles.text}>
                        <FontAwesomeIcon style={{ flex: 0 }} name='step-backward' size={30} color={color} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.playPause} disabled={disabled}>
                    <View style={styles.text}>
                        <FontAwesomeIcon name={state == 'pause' ? 'play' : 'pause'} size={30} color={color} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.next} disabled={disabled}>
                    <View style={styles.text}>
                        <FontAwesomeIcon name='step-forward' size={30} color={color} />
		    </View>
                </TouchableOpacity>
            </View>
        )
    }
}

const mapStateToProps = state => {    
    const playerState = state.status.player
    
    return {
        state: playerState
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onPlayPause: (state) => { dispatch(playPause(state)) },
        onNext: () => { dispatch(playNext()) },
        onPrevious: () => { dispatch(playPrevious()) },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls)

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'center',
        height: 50,
    },
    text: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        width: 60,
    },
    enabled: {
        fontSize: 30,
        color: 'black',
    },
    disabled: {
        fontSize: 30,
        color: 'lightgray',
    }
})
