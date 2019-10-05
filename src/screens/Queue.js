import React from 'react'
import {
  View,
  StyleSheet,
} from 'react-native'

// Queue List component.
import Browsable, { OPTIONS } from '../components/common/Browsable'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { setCurrentSong, deleteSongs, clear, moveSong }  from '../redux/reducers/queue/actions'
import { playPause } from '../redux/reducers/player/actions'

class Queue extends React.Component {
  handleMenuPress = () => {
    const { navigation } = this.props
    navigation.navigate('QueueSettings')
  }

  componentDidMount() {
    this.props.navigation.setParams({ onMenu: this.handleMenuPress })
  }

  render() {
    const { navigation, content, queueSize } = this.props

    const options = [{ value: 'ADD_TO_PLAYLIST', title: 'To a playlist' }]

    return (
      <View style={styles.container}>
        <Browsable
          content={content} 
          navigation={navigation}
          canEdit={true}
          canDelete={true}
          canRearrange={true}
          queueSize={queueSize}
          onItemMoved={this.handleItemMove}
          onDeleteItems={this.handleItemsDelete}
          confirmDelete={false}
          addOptions={options}
          onSelection={this.handleItemSelected}
        />
      </View>
    )
  }

  // Events.
  
  handleItemMove = ({ row, to }) => {
    const { moveSong } = this.props
    moveSong(row.id, to)
  }

  handleItemsDelete = (items) => {
    const { remove } = this.props
    const ids = items.map(item => { return item.id })

    console.log('deleting songs: ' + JSON.stringify(items))

    remove(ids)
  }

  handleItemSelected = ({ id, status }) => {
    const { play, playPause } = this.props
    if (status === 'none') {
        play(id)
    } else if (status === 'play') {
        playPause('pause')
    } else {
        playPause('play')
    }
  }
}

const queueToList = (state) => {
  const player = state.status.player
  const currentSongId = player === 'stop' ? null : state.currentSong.songId   

  return state.queue.map((song, index) => {
    let name = song.title
    if (name === null) {
      name = song.file
    }

    let artist = song.artist
    if (artist == null) {
      artist = 'Unknown Artist'
    }

    return {
      id: song.songId,
      path: song.file,
      name: name,
      title: name,
      artist: artist,
      index: index,
      type: 'FILE',
      status: (song.songId === currentSongId ? player : 'none')
    }
  })
}

const mapStateToProps = state => {
  let queueSize = state.queue.length
  let queue = queueToList(state)

  return {
    content: queue,
    queueSize: queueSize,
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
    },
    addToPlaylist: (name, items) => {
      dispatch(addToPlaylist(name, items))
    },
    moveSong: (id, to) => {
      dispatch(moveSong(id, to))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Queue)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})

