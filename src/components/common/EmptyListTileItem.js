import React from 'react'
import {
  View,
  Dimensions,
} from 'react-native'

class EmptyListTileItem extends React.Component {
  render() {
    const { height, width } = this.props

    return (
      <View style={{height: height, width: width}}>
      </View>
    )
  }
}

export default EmptyListTileItem
