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
import { setCurrentSong, deleteSongs, clear }  from '../redux/reducers/queue/actions'
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

const CustomLayoutAnimation = {
    duration: 200,
    create: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity,
    },
    update: {
        type: LayoutAnimation.Types.easeInEaseOut,
    },
}

const HighlightableQueueListItem = HighlightableView(QueueListItem)

class QueueList extends React.Component {
    state = {
        selected: [],
        editing: false,
    }

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

    render() {
        return (
            <FlatList 
                style={styles.container}
                data={this.props.queue}
                keyExtractor={this.keyExtractor}
                renderItem={this.renderItem}
                extraData={this.state.selected}
            />
        )
    }

    keyExtractor = (item, index) => item.songId

    renderItem = ({item}) => {
        const { selected } = this.state
        const { songId: id } = item
        const isSelected = (selected.find(el => { return el.id === id }) != null)

        return <QueueListItem
            item={{ id: item.songId, status: item.status, name: item.name }}
            selected={isSelected}
            subtitle={item.subtitle}
            onTap={this.onPressItem}
            onLongTap={this.onLongPressItem}
            onDeleteItem={this.onDeleteItem}
        />
    }

    onPressItem = ({ id, status, name }) => {
        const { editing, selected } = this.state
        const { navigation, queue } = this.props

        if (editing) {
            let newSelected = selected.slice()
            if (selected.find(el => { return el.id === id }) != null) {
                newSelected = selected.filter(el => { return el.id !== id })

                if (newSelected.length == 0) {
                    this.onCancelEditing()
                } else {
                    // First update own state.
                    this.setState({
                        selected: newSelected,
                    })

                    // Update navigation bar state.
                    navigation.setParams({
                        allSelected: newSelected.length === queue.length
                    })
                }
            } else {
                newSelected.push({ id, status, name })
                this.setState({
                    selected: newSelected,
                })
            }
            return
        }

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
        const { navigation, queue } = this.props
        const { editing, selected } = this.state
        
        let newSelected = selected.slice()
        if (selected.find(el => { return el.id === id }) != null) {
            newSelected = selected.filter(el => { return el.id !== id })
        } else {
            newSelected.push({ id, status, name })
        }

        // Update state.
        this.setState({
            editing: true,
            selected: newSelected,
        })

        // Update navigation bar state.
        navigation.setParams({
            editing: true,
            allSelected: newSelected.length === queue.length
        })

    }

    onDeleteItem = ({ id }) => {
        const { remove } = this.props
        const { selected } = this.state

        remove([id])
        
        this.setState({
            selected: selected.filter(item => { return item.id !== id })
        })
    }
    
    onCancelEditing = () => {
        const { navigation } = this.props
        navigation.setParams({ editing: false })

        const { selected } = this.state

        LayoutAnimation.configureNext(CustomLayoutAnimation)

        this.setState({
            selected: [],
            editing: false,
        })
    }

    onConfirmEditing = () => {
        const { remove, navigation } = this.props
        const { selected } = this.state
        const ids = selected.map(item => { return item.id })

        this.setState({
            selected: [],
            editing: false,
        })

        navigation.setParams({
            editing: false,
        })

        remove(ids)
    }

    onGlobalSelectionToggled = (all) => {
        const { navigation, queue } = this.props

        if (all) {
            const items = queue.map((item, index) => {
                return {
                    name: item.name,
                    id: item.songId
                }
            })

            this.setState({
                selected: items,
            })

            // Update navigation bar state.
            navigation.setParams({
                allSelected: true,
            })
        } else {
            this.setState({
                selected: [],
            })

            // Update navigation bar state.
            navigation.setParams({
                allSelected: false,
            })
        }
    }

    componentDidMount() {
       this.props.navigation.setParams({
            onCancelEditing: this.onCancelEditing,
            onConfirmEditing: this.onConfirmEditing,
            onGlobalSelectionToggled: this.onGlobalSelectionToggled,
        })
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
        remove: (songIds) => {
            dispatch(deleteSongs(songIds))
        },
        clear: () => {
            dispatch(clear())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(QueueList)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})
