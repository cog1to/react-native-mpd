import LocalStorage from '../storage/LocalStorage'
import LightTheme from './Light'

export default class ThemeManager {
  constructor(getter, setter) {
    this.getter = getter
    this.setter = setter
    this.currentTheme = 'Light'
    this.themes = {
      'Light': LightTheme
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
    this.setter(name, (error, result) => {
      if (error == null) {
        self.currentName = name
      }
    })
  }

  getCurrentTheme() {
    return this.themes[this._getCurrentThemeName()]
  }

  createTheme(name, definition) {
    this.themes[name] = definition
  }

  load(callback) {
    let self = this
    this.getter((error, result) => {
      if (error == null && result != null) {
        self.currentTheme = result
      }

      callback(error)
    })
  }
}

const _instance = new ThemeManager(LocalStorage.instance().getTheme, LocalStorage.instance().setTheme)
