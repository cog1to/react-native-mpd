import React from 'react'
import PropTypes from 'prop-types'
import { 
    View, 
    StyleSheet,
    Text,
    FlatList,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native'

// Song prop types.
import { queuePropTypes } from '../redux/reducers/queue/reducer'

// Redux.
import { connect } from 'react-redux';

// Actions.
import { setCurrentSong, deleteSong }  from '../redux/reducers/queue/actions'
import { playPause } from '../redux/reducers/player/actions'

// List item.
import QueueListItem from './QueueListItem'

// Highlightable wrapper.
import { HighlightableView } from './common/HighlightableView'

if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RowAnimation = {
    duration: 150,
    create: { type: 'linear', property: 'opacity' }, 
    update: { type: 'linear', property: 'opacity' }, 
    delete: { type: 'linear', property: 'opacity' }
}

const HighlightableQueueListItem = HighlightableView(QueueListItem)

class QueueList extends React.Component {
    
    static propTypes = {
        queue: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string.isRequired,
            subtitle: PropTypes.string,
            status: PropTypes.string,
            songId: PropTypes.string.isRequired,
        }))
    }

    static defaultProps = {
        queue: [],
    }

    componentWillReceiveProps(nextProps) {
        LayoutAnimation.configureNext(RowAnimation)
    }

    render() {
        return (
            <FlatList 
                style={styles.container}
                data={this.props.queue}
                keyExtractor={this.keyExtractor}
                renderItem={this.renderItem}
            />
        )
    }

    keyExtractor = (item, index) => item.songId

    renderItem = ({item}) => {
        return <HighlightableQueueListItem
            item={{ id: item.songId, status: item.status, name: item.name }}
            subtitle={item.subtitle}
            onTap={this.onPressItem}
            onLongTap={this.onLongPressItem}
            onDeleteItem={this.onDeleteItem}
        />
    }

    onPressItem = ({ id, status, name }) => {
        const { play, playPause } = this.props
        if (status === null) {
            play(id)
        } else if (status === 'play') {
            playPause('pause')
        } else {
            playPause('play')
        }
    }

    onLongPressItem = ({ id, status, name }) => {

    }

    onDeleteItem = (id) => {
        const { remove } = this.props
        remove(id)
    }
}

const queueToList = (state) => {
    const player = state.status.player
    const currentSongId = player === 'stop' ? null : state.currentSong.songId   

    return state.queue.map(song => {
        let name = song.title
        if (name === null) {
            name = song.file
        }

        let artist = song.artist

        return {
            songId: song.songId,
            name: name,
            subtitle: artist,
            status: (song.songId === currentSongId ? player : null)
        }
    })
}

const mapStateToProps = state => {
    return {
        queue: queueToList(state),      
    }
}

const mapDispatchToProps = dispatch => {
    return {
        play: (songId) => {
            dispatch(setCurrentSong(songId))
        },
        playPause: (state) => {
            dispatch(playPause(state))
        },
        remove: (songId) => {
            dispatch(deleteSong(songId))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(QueueList)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})
