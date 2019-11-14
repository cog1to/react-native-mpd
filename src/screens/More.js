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
import { NavigationActions } from 'react-navigation'

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
    const { title, lastRow, textStyle, leftPadding } = this.props

    const theme = ThemeManager.instance().getCurrentTheme()

    let style = styles.rowContent
    if (!lastRow) {
      style = {...style, ...styles.bottomBorder}
    }

    let rowStyle = styles.row
    if (!leftPadding) {
      rowStyle = {...rowStyle, paddingLeft: 0}
    }

    let textStyleResolved = textStyle != null ? textStyle : styles.title

    return (
      <TouchableHighlight 
        onPress={this.handleOnPress} 
        underlayColor={theme.accentColor+'30'}>
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

    const action = NavigationActions.navigate({
      routeName: route,
    })
    navigation.dispatch(action)
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
    return (
      <View style={{flex: 1}}>
        <ScrollView style={styles.container}>
          <View style={styles.rowGroup}>
            <OptionRow 
              title='Search'
              onTapped={() => this.navigate(ROUTES.SEARCH)}
            />
            <OptionRow 
              title='Playlists'
              onTapped={() => this.navigate(ROUTES.PLAYLISTS)}
              lastRow={true}
            />
          </View>
          <View style={styles.rowGroup}>
            <OptionRow 
              title='Outputs'
              onTapped={() => this.navigate(ROUTES.OUTPUTS)}
              lastRow={true}
            />
          </View>
          <View style={styles.rowGroup}>
            <OptionRow 
              title='Log Out'
              onTapped={() => this.handleLogout()}
              lastRow={true}
              textStyle={styles.logoutTitle}
              leftPadding={false}
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

export default connect(null, mapDispatchToProps)(More)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ThemeManager.instance().getCurrentTheme().tableBackgroundColor,
  },
  rowGroup: {
    ...elevationShadowStyle(2),
    marginVertical: 10,
    marginTop: 20,
    flexDirection: 'column',
    backgroundColor: ThemeManager.instance().getCurrentTheme().backgroundColor,
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
    fontSize: ThemeManager.instance().getCurrentTheme().mainTextSize,
    color: ThemeManager.instance().getCurrentTheme().accentColor,
  },
  title: {        
    fontWeight: Platform.OS === 'android' ? 'normal' : '500',
    fontSize: ThemeManager.instance().getCurrentTheme().mainTextSize,
    color: ThemeManager.instance().getCurrentTheme().mainTextColor,
  },
  bottomBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ABABAB",
  },
})
