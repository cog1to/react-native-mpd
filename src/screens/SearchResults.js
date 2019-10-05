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
    const { navigation, queueSize, position } = this.props
    const { state: { params: { content } } } = navigation

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
        />
      </View>
    )
  }
}

const mapStateToProps = state => {
  const { position = null } = state.currentSong

  return {
    queueSize: state.queue.length,
    position: position
  }
}

export default connect(mapStateToProps)(SearchResults)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
