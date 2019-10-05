import React from 'react'
import {
  View,
  StyleSheet,
} from 'react-native'

// Redux.
import { connect } from 'react-redux'

// Items list.
import Browsable from '../components/common/Browsable'

export default class SearchResults extends React.Component {
  render() {
    const { navigation } = this.props
    const { state: { params: { content } } } = navigation

    return (
      <View style={styles.container}>
        <Browsable
          content={content}
          navigation={navigation}
          canDelete={false}
          canEdit={true}
          canArrange={false}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
