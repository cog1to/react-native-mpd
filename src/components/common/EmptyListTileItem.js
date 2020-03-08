import React from 'react'
import {
  View,
  Dimensions,
} from 'react-native'

class EmptyListTileItem extends React.Component {
  render() {
    const { height } = this.props
    const width = Dimensions.get('window').width / 2.0 - 8.0

    return (
      <View style={{height: height, width: width}}>
      </View>
    )
  }
}

export default EmptyListTileItem
