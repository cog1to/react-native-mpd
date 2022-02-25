import React from 'react';
import {
  View,
  TouchableOpacity
} from 'react-native'
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons'

export default class MaterialBarButton extends React.Component {
  render() {
    const { onPress, theme, icon, style } = this.props

    return (
      <TouchableOpacity onPress={onPress} style={{...style}}>
        <MaterialCommunityIcon
          name={icon}
          size={24}
          color={theme.navigationBarIconColor}
        />
      </TouchableOpacity>
    )
  }
}