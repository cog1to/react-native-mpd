import React from 'react'
import {
  View,
  ScrollView,
  Button,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text
} from 'react-native'
import PropTypes from 'prop-types'
import { NavigationActions } from 'react-navigation'

// Device info.
import DeviceInfo from 'react-native-device-info'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { search } from '../redux/reducers/search/actions'

// Input control.
import Input from '../components/common/Input'

// Keyboard state listener.
import KeyboardState from '../components/common/KeyboardState'

// Themes.
import ThemeManager from '../themes/ThemeManager'

// Safe area check.
import { isIphoneX } from '../utils/IsIphoneX';

import { SafeAreaView } from 'react-native-safe-area-context'

Fields = [
  { ID: 'TITLE', title: 'Title', tag: 'title', },
  { ID: 'ARTIST', title: 'Artist', tag: 'artist', },
  { ID: 'ALBUM', title: 'Album', tag: 'album', },
  { ID: 'ALBUM_ARTIST', title: 'Album Artist', tag: 'albumartist', },
  { ID: 'YEAR', title: 'Year', tag: 'date', },
  { ID: 'GENRE', title: 'Genre', tag: 'genre', },
  { ID: 'FILENAME', title: 'Filename', tag: 'filename', },
]

class KeyboardAwareSearchForm extends React.Component {
  state = {
    layout: null,
  }

  static propTypes = {
    // From `KeyboardState`
    keyboardHeight: PropTypes.number.isRequired,
    keyboardVisible: PropTypes.bool.isRequired,
    keyboardWillShow: PropTypes.bool.isRequired,
    keyboardWillHide: PropTypes.bool.isRequired,
    keyboardAnimationDuration: PropTypes.number.isRequired,
    screenY: PropTypes.number.isRequired,

    // Rendering content
    children: PropTypes.node,
  }

  static defaultProps = {
    children: null,
  }

  handleLayout = event => {
    const { nativeEvent: { layout } } = event

    if (this.state.layout == null) {
      this.setState({
        layout,
      })
    }
  }

  render() {
    const { layout } = this.state

    const {
      children,
      keyboardHeight,
      keyboardVisible,
      keyboardAnimationDuration,
      keyboardWillShow,
      keyboardWillHide,
      screenY,
    } = this.props

    let hasSafeArea = function() {
      let device = DeviceInfo.getDeviceId()
      if (device.startsWith("iPhone")) {
        let model = parseInt(device.split(',')[0].substring("iPhone".length))
        if (model >= 11) {
          return true
        }
      }
      return false
    }()

    const containerStyle = (layout != null && Platform.OS === 'ios')
      ? { height: keyboardVisible ? (screenY - layout.y - (hasSafeArea ? 88 : 64)) : layout.height }
      : { }

    return (
      <View style={containerStyle} onLayout={this.handleLayout}>
        {children}
      </View>
    )
  }
}

class Search extends React.Component {
  state = {
    dirty: false,
    criteria: {},
  }

  showResults = (content) => {
    const { navigation } = this.props

    content.forEach(item => {
      item.status = 'none'
    })

    const action = NavigationActions.navigate({
      params: {
        content: content,
      },
      routeName: 'SearchResults',
    })
    navigation.dispatch(action)
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { results } = nextProps
    const { theme: nextTheme } = nextProps
    const { theme } = this.props

    let dirty = nextState.dirty || (theme != nextTheme)

    if (!dirty && results != null) {
      this.showResults(results)
      return false
    }

    return true
  }

  onChangeText = (text, fieldId) => {
    let newCriteria = Object.assign({}, this.state.criteria)
    newCriteria[fieldId] = text
    this.setState({
      criteria: newCriteria,
      dirty: true,
    })
  }

  onSearch = () => {
    const { doSearch } = this.props
    const tags = this.state.criteria

    const nonEmptyTags = Object.keys(tags).filter((key) => {
      return (key in tags) && tags[key] !== null && tags[key].length > 0
    })

    const total = nonEmptyTags.map(tag => {
      return { tag: tag, value: tags[tag] }
    })

    this.setState({
      dirty: false,
    }, () => doSearch(total))
  }

  render() {
    const { criteria } = this.state
    const { theme } = this.props
    
    const themeValue = ThemeManager.instance().getTheme(theme)
    const borderBottomColor = themeValue.accentColor
    const backgroundColor = themeValue.backgroundColor
    const searchButtonColor = themeValue.searchButtonColor

    return (
      <SafeAreaView style={{...styles.container, backgroundColor: backgroundColor}}>
        <KeyboardState>
          {keyboardInfo => (
            <KeyboardAwareSearchForm {...keyboardInfo}>
              <ScrollView keyboardShouldPersistTaps='always'>
                {Fields.map(({ ID, title, tag }) => {
                  return (
                    <Input
                      borderBottomColor={borderBottomColor}
                      key={ID}
                      placeholder={title}
                      onChangeText={(text) => this.onChangeText(text, tag)}
                      value={criteria[tag]}
                      placeholderColor={themeValue.placeholderColor}
                    />
                  )
                })}
                <View style={styles.search}>
                  <TouchableOpacity style={{...styles.button, backgroundColor: searchButtonColor}} onPress={this.onSearch}>
                    <Text style={{...styles.buttonText, color: backgroundColor}}>Search</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAwareSearchForm>
          )}
        </KeyboardState>
      </SafeAreaView>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    doSearch: (expression) => {
      dispatch(search(expression))
    }
  }
}

const mapStateToProps = (state) => {
  const results = state.search
  const theme = state.storage.theme

  return {
    results: results,
    theme: theme,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
    paddingHorizontal: 20,
  },
  search: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3
  },
  buttonText: {
    fontSize: 18,
    lineHeight: 21,
    fontWeight: 'bold',
  }
})

