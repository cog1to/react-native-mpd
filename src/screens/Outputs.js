import React from 'react'
import {
  View,
  StyleSheet,
  Platform,
  Text,
  TouchableHighlight,
  ScrollView,
  Switch,
} from 'react-native'
import PropTypes from 'prop-types'

// Actions.
import { disableOutput, enableOutput, getOutputs } from '../redux/reducers/outputs/actions'

// Redux.
import { connect } from 'react-redux'

// Themes.
import ThemeManager from '../themes/ThemeManager'

// Shadow style that works on both iOS and Android.
import { elevationShadowStyle } from '../utils/Styles'

class ToggleRow extends React.Component {
  handleOnPress = () => {
    const { onTapped } = this.props
    onTapped()
  }

  static defaultProps = {
    lastRow: false,
  }

  render() {
    const { title, subtitle, value, lastRow, theme } = this.props

    let style = styles.rowContent
    if (!lastRow) {
      style = {...style, ...styles.bottomBorder}
    }

    return (
      <TouchableHighlight 
        onPress={this.handleOnPress} 
        underlayColor={theme.accentColor+'30'}>
        <View style={styles.row}>
          <View style={style}>
            <View style={styles.rowText}>
              <Text style={{...styles.title, color: theme.mainTextColor}}>{title}</Text>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <Text style={{...styles.subtitle, color: theme.lightTextColor}}>{subtitle}</Text>
              </View>
            </View>
            <View pointerEvents='none' style={styles.switchContainer}>
              <Switch 
                value={value == 0 ? false : true}
                disabled={false}
                trackColor={{true:theme.activeColor+'70'}}
                thumbColor={value == 0 ? null : theme.activeColor}
              />
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  }
}

class Outputs extends React.Component {
  static defaultProps = {
    outputs: []
  }

  componentDidMount() {
    const { getOutputs } = this.props
    getOutputs()
  }

  render() {
    const { outputs, theme } = this.props

    let items = outputs.map((item, index) => ({
      name: item.name,
      plugin: item.plugin,
      id: item.id,
      enabled: item.enabled,
      last: index == outputs.length - 1
    }))

    const themeValue = ThemeManager.instance().getTheme(theme)
    const backgroundColor = themeValue.tableBackgroundColor
    const rowGroupBack = themeValue.backgroundColor

    return (
      <View style={{flex: 1}}>
        <ScrollView style={{...styles.container, backgroundColor: backgroundColor}}>
          <View style={{...styles.rowGroup, backgroundColor: rowGroupBack}}>
            {items.map((item) => 
              <ToggleRow 
                key={item.id}
                subtitle={'Plugin: ' + item.plugin}
                title={item.name}
                onTapped={() => this.toggle(item.id)}
                value={item.enabled ? 1 : 0}
                lastRow={item.last}
                theme={themeValue}
              />
            )}
          </View>
        </ScrollView>
      </View>
    )
  }

  toggle = (id) => {
    const { disableOutput, enableOutput, outputs } = this.props
    let enabled = outputs.find((item) => { return item.id == id }).enabled

    if (enabled) {
      disableOutput(id)
    } else {
      enableOutput(id)
    }
  }
}

const mapStateToProps = state => {
  const { outputs } = state
  const theme = state.storage.theme

  return { outputs, theme }
}

const mapDispatchToProps = dispatch => {
  return {
    getOutputs: () => dispatch(getOutputs()),
    disableOutput: (id) => dispatch(disableOutput(id)),
    enableOutput: (id) => dispatch(enableOutput(id)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Outputs)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    rowGroup: {
        ...elevationShadowStyle(2),
        marginVertical: 10,
        marginTop: 20,
        flexDirection: 'column',
    },
    row: {
        paddingLeft: 20,
        flexDirection: 'column',
    },
    rowContent: {
        paddingVertical: 8,
        paddingRight: 20,
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    bottomBorder: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: "#ABABAB",
    },
    rowText: {
        flexDirection: 'column',
        marginVertical: 2,
        flex: 1,
    },
    title: {        
        fontWeight: Platform.OS === 'android' ? 'normal' : '500',
        fontSize: ThemeManager.instance().getCurrentTheme().mainTextSize,
        marginBottom: Platform.OS === 'android' ? 0 : 2,
    },
    subtitle: {
        fontSize: ThemeManager.instance().getCurrentTheme().subTextSize,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 50,
        marginLeft: 16,
    },
    rowSlider: {
        paddingVertical: 8,
        paddingRight: 20,
        flexDirection: 'column',
    }
})
