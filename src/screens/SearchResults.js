import React from 'react'
import {
  View,
  StyleSheet,
} from 'react-native'

// Redux.
import { connect } from 'react-redux'

// Items list.
import Browsable from '../components/common/Browsable'

class SearchResults extends React.Component {
  render() {
    const { navigation, route, queueSize, position, theme } = this.props
    const { params: { content }, title } = route

    return (
      <View style={styles.container}>
        <Browsable
          content={content}
          navigation={navigation}
          canDelete={false}
          canEdit={true}
          canArrange={false}
          queueSize={queueSize}
          position={position}
          theme={theme}
          title={title}
          mode='list'
        />
      </View>
    )
  }
}

const mapStateToProps = state => {
  const { position = null } = state.currentSong
  const { theme } = state.storage

  return {
    queueSize: state.queue.length,
    position: position,
    theme: theme,
  }
}

export default connect(mapStateToProps)(SearchResults)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
