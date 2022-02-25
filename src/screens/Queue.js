import React from 'react'
import {
  View,
  StyleSheet,
} from 'react-native'

// Components.
import Browsable, { OPTIONS } from '../components/common/Browsable'
import BarButton from '../components/common/BarButton'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { setCurrentSong, deleteSongs, clear, moveSong }  from '../redux/reducers/queue/actions'
import { playPause } from '../redux/reducers/player/actions'

// Theme.
import ThemeManager from '../themes/ThemeManager'

const compareLists = (left, right) => {
  if (left.length != right.length) {
    return true
  }

  for (let index = 0; index < left.length; index++) {
    if (left[index].id != right[index].id || left[index].status != right[index].status) {
      return true
    }
  }

  return false
}

class Queue extends React.Component {
  state = {
    tempData: null,
  }

  handleMenuPress = () => {
    const { navigation } = this.props
    navigation.navigate('QueueSettings')
  }

  static getDerivedStateFromProps(props, state) {
    if (state.tempData != null && compareLists(state.tempData, props.content)) {
      return {
        tempData: null,
      }
    }

    return null
  }

  render() {
    const { navigation, content, queueSize, theme } = this.props
    const { tempData } = this.state

    const data = tempData != null ? tempData : content

    const options = [{ value: 'ADD_TO_PLAYLIST', title: 'To a playlist' }]

    return (
      <View style={styles.container}>
        <Browsable
          content={data}
          navigation={navigation}
          canEdit={true}
          canDelete={true}
          canSwipeDelete={true}
          canRearrange={true}
          queueSize={queueSize}
          onItemMoved={this.handleItemMove}
          onDeleteItems={this.handleItemsDelete}
          confirmDelete={false}
          addOptions={options}
          onSelection={this.handleItemSelected}
          theme={theme}
          defaultIcon='settings'
          onIconTapped={this.handleMenuPress}
        />
      </View>
    )
  }

  // Events.

  handleItemMove = ({ data, from, to }) => {
    const oldData = this.state.tempData != null ? this.state.tempData : this.props.content
    let oldId = oldData[from].id

    this.setState({
      tempData: data,
    })

    const { moveSong } = this.props
    moveSong(oldId, to)
  }

  handleItemsDelete = (items) => {
    const { remove } = this.props
    const ids = items.map(item => { return item.id })

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
  let theme = state.storage.theme

  return {
    content: queue,
    queueSize: queueSize,
    theme: theme
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

