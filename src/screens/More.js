import React from 'react'
import {
  View,
  StyleSheet,
  Platform,
  Text,
  TouchableHighlight,
  ScrollView,
  Alert,
} from 'react-native'
import PropTypes from 'prop-types'

// Actions.
import { disconnect } from '../redux/reducers/status/actions'

// Redux.
import { connect } from 'react-redux'

// Themes.
import ThemeManager from '../themes/ThemeManager'

// Shadow style that works on both iOS and Android.
import { elevationShadowStyle } from '../utils/Styles'

class OptionRow extends React.Component {
  handleOnPress = () => {
    const { onTapped } = this.props
    onTapped()
  }

  static defaultProps = {
    lastRow: false,
    textStyle: null,
    leftPadding: true,
  }

  render() {
    const { title, lastRow, textStyle, leftPadding, theme } = this.props

    const themeValue = ThemeManager.instance().getTheme(theme)
    const backgroundColor = themeValue.tableBackgroundColor
    const textColor = themeValue.mainTextColor

    let style = styles.rowContent
    if (!lastRow) {
      style = {...style, ...styles.bottomBorder}
    }

    let rowStyle = styles.row
    if (!leftPadding) {
      rowStyle = {...rowStyle, paddingLeft: 0}
    }

    let textStyleResolved = (textStyle != null) ? textStyle : {...styles.title, color: textColor}

    return (
      <TouchableHighlight 
        onPress={this.handleOnPress} 
        underlayColor={themeValue.accentColor+'30'}>
        <View style={rowStyle}>
          <View style={style}>
            <View style={styles.rowText}>
              <Text style={textStyleResolved}>{title}</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

const ROUTES = {
  PLAYLISTS: 'Playlists',
  SEARCH: 'Search',
  OUTPUTS: 'Outputs',
}

class More extends React.Component {
  navigate = (route) => {
    const { navigation } = this.props

    navigation.navigate(route)
  }

  handleLogout = () => {
    const { disconnect } = this.props

    Alert.alert(
      'Log out',
      'Are you sure you want to disconnect from current MPD server?',
      [
        {
          text: 'Disconnect',
          onPress: disconnect
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {cancelable: true},
    )
  }

  render() {
    const { theme } = this.props

    const themeValue = ThemeManager.instance().getTheme(theme)
    const backgroundColor = themeValue.tableBackgroundColor
    const rowGroupBack = themeValue.backgroundColor
    const logOutColor =  themeValue.lightTextColor

    return (
      <View style={{flex: 1}}>
        <ScrollView style={{...styles.container, backgroundColor: backgroundColor}}>
          <View style={{...styles.rowGroup, backgroundColor: rowGroupBack}}>
            <OptionRow 
              title='Search'
              onTapped={() => this.navigate(ROUTES.SEARCH)}
              theme={theme}
            />
            <OptionRow 
              title='Playlists'
              onTapped={() => this.navigate(ROUTES.PLAYLISTS)}
              lastRow={true}
              theme={theme}
            />
          </View>
          <View style={{...styles.rowGroup, backgroundColor: rowGroupBack}}>
            <OptionRow 
              title='Outputs'
              onTapped={() => this.navigate(ROUTES.OUTPUTS)}
              lastRow={true}
              theme={theme}
            />
          </View>
          <View style={{...styles.rowGroup, backgroundColor: rowGroupBack}}>
            <OptionRow 
              title='Log Out'
              onTapped={() => this.handleLogout()}
              lastRow={true}
              textStyle={{...styles.logoutTitle, color: logOutColor}}
              leftPadding={false}
              theme={theme}
            />
          </View>
        </ScrollView>
      </View>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    disconnect: () => dispatch(disconnect())
  }
}

const mapStateToProps = state => {
  return { theme: state.storage.theme }
}

export default connect(mapStateToProps, mapDispatchToProps)(More)

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  rowGroup: {
    ...elevationShadowStyle(2),
    marginVertical: 10,
    marginTop: 20,
    flexDirection: 'column'
  },
  row: {
    paddingLeft: 20,
    flexDirection: 'column',
  },
  rowText: {
    flexDirection: 'column',
    marginVertical: 14,
    flex: 1,
  },
  logoutTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: ThemeManager.instance().getCurrentTheme().mainTextSize
  },
  title: {        
    fontWeight: Platform.OS === 'android' ? 'normal' : '500',
    fontSize: ThemeManager.instance().getCurrentTheme().mainTextSize
  },
  bottomBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ABABAB",
  },
})
