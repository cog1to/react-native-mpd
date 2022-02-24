import React from 'react';
import {
  View,
  TouchableOpacity
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

export default class BarButton extends React.Component {
  render() {
    const { onPress, theme, icon, padding } = this.props

    return (
      <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: padding }}>
        <Icon
          name={icon}
          size={24}
          color={theme.navigationBarIconColor}
        />
      </TouchableOpacity>
    )
  }
}