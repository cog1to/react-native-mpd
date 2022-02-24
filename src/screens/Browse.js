import React from 'react'

// React-native components.
import {
  View,
  StyleSheet,
} from 'react-native'

// Navigation actions.
import { CommonActions } from '@react-navigation/native'

// Browsable common logic.
import Browsable from '../components/common/Browsable'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { changeCurrentDir } from '../redux/reducers/browser/actions'

// Browse screen.
class Browse extends React.Component {
  static defaultProps = {
    content: [],
    refreshing: false,
  }

  componentDidMount() {
    this.reload()
  }

  reload = () => {
    const { navigation, loadCurrentDir, route } = this.props
    const { params: { dir } } = route
    loadCurrentDir(dir, true)
  }

  // Rendering.

  render() {
    const { content, navigation, refreshing, queueSize, position, theme } = this.props

    return (
      <View style={styles.container}>
        <Browsable
          content={content}
          onNavigate={this.onNavigate}
          refreshing={refreshing}
          onRefresh={this.onRefresh}
          queueSize={queueSize}
          canAdd={true}
          canEdit={true}
          position={position}
          navigation={navigation}
          mode='list'
          theme={theme}
        />
      </View>
    )
  }

  // Events.

  onRefresh = () => {
    this.reload()
  }

  onNavigate = (item) => {
    const { navigation, route } = this.props
    const { params: { dir } } = route

    const newDir = dir.slice()
    newDir.push(item.name)

    const action = CommonActions.navigate({
      name: 'Browse', 
      key: 'Browse' + newDir,
      params: {
        name: item.name,
        dir: newDir
      }
    })
    navigation.dispatch(action)
  }
}

const nodeFromPath = (path, tree) => {
  let node = tree

  if (node === null) {
    return null
  }

  path.length > 1 && path.slice(1).forEach((element) => {
    node = node.children.filter((child) => child.name === element)[0]
  })

  return node
}

const mapStateToProps = (state, ownProps) => {
  const { route: { params: { dir = [''] } } } = ownProps
  const { tree, refreshing } = state.browser
  const { position = null, file = null } = state.currentSong
  let theme = state.storage.theme
  
  // Get content without playlistst. They are displayed in a separate screen.
  let content = tree != null ? nodeFromPath(dir, tree).children : []
  content = content.filter(item => { return item.type !== 'PLAYLIST' })

  // Supply with item with ID from the Queue, if possible, and playback status.
  let contentWithIds = content.map(item => {
    const found = state.queue.find(el => {
      return el.file === item.fullPath
    })

    return {
      ...item,
      id: (found != null ? found.songId : null),
      status: (item.fullPath === file) ? 'play' : 'none',
    }
  })

  let queueSize = state.queue.length

  return {
    ...ownProps,
    content: contentWithIds,
    theme: theme,
    refreshing,
    queueSize,
    position,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    loadCurrentDir: (path, force = false) => {
      dispatch(changeCurrentDir(path, force))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Browse)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
