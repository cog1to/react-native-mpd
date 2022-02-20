import LocalStorage from '../storage/LocalStorage'
import LightTheme from './Light'
import DarkTheme from './Dark'
import { Appearance } from 'react-native-appearance'
// Redux.
import { store } from 'react-redux'
import { saveTheme, themeChanged } from '../redux/reducers/storage/actions'

export default class ThemeManager {

  constructor() {
    this.store = store
    this.currentTheme = 'Light'
    this.themes = {
      'Light': LightTheme,
      'Dark': DarkTheme
    }
  }

  static instance() {
    return _instance
  }

  _getCurrentThemeName() {
    return this.currentTheme
  }

  setCurrentTheme(name) {
    let self = this
    LocalStorage.instance().setTheme(name, (error, result) => {
      if (error == null) {
        self.currentName = name
        self.store.dispatch(themeChanged(name))
      }
    })
  }

  getCurrentTheme() {
    let scheme = Appearance.getColorScheme()
    return scheme == 'light' ? this.themes['Light'] : this.themes['Dark']
  }

  createTheme(name, definition) {
    this.themes[name] = definition
  }

  getTheme(name) {
    return this.themes[name]
  }

  load(callback) {
    let self = this
    LocalStorage.instance().getTheme((error, result) => {
      if (error == null && result != null) {
        self.currentTheme = result
      }

      callback(error)
    })
  }
}

const _instance = new ThemeManager()
