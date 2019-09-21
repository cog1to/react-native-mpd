import { Keyboard, Platform } from 'react-native';
import PropTypes from 'prop-types';
import React from 'react';

const INITIAL_ANIMATION_DURATION = 200;

export default class KeyboardState extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      screenY: 0,
      keyboardHeight: 0,
      keyboardVisible: false,
      keyboardWillShow: false,
      keyboardWillHide: false,
      keyboardAnimationDuration: INITIAL_ANIMATION_DURATION,
    };
  }

  componentWillMount() {
    if (Platform.OS === 'ios') {
      this.subscriptions = [
        Keyboard.addListener(
          'keyboardWillShow',
          this.keyboardWillShow,
        ),
        Keyboard.addListener(
          'keyboardWillHide',
          this.keyboardWillHide,
        ),
        Keyboard.addListener('keyboardDidShow', this.keyboardDidShow),
        Keyboard.addListener('keyboardDidHide', this.keyboardDidHide),
      ];
    } else {
      console.log('adding keyboard listeners')
      this.subscriptions = [
        Keyboard.addListener('keyboardDidHide', this.keyboardDidHide),
        Keyboard.addListener('keyboardDidShow', this.keyboardDidShow),
      ];
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.remove());
  }

  keyboardWillShow = event => {
    this.setState({ keyboardWillShow: true });
    this.measure(event);
  };

  keyboardDidShow = event => {
    this.measure(event, true);
  };

  keyboardWillHide = event => {
    this.setState({ keyboardWillHide: true });
    this.measure(event);
  };

  keyboardDidHide = () => {
    this.setState({
      keyboardWillHide: false,
      keyboardVisible: false,
    });
  };

  measure = (event, didShow = false) => {
    const {
      endCoordinates: { height, screenY },
      duration = INITIAL_ANIMATION_DURATION,
    } = event;

    let newState = Object.assign({}, this.state)
    newState = {
      screenY: screenY,
      keyboardHeight: height,
      keyboardAnimationDuration: duration,
    }

    if (didShow) {
      newState.keyboardWillShow = false
      newState.keyboardVisible = true
    }

    this.setState(newState)
  };

  render() {
    const { children } = this.props;
    const {
      keyboardHeight,
      keyboardVisible,
      keyboardWillShow,
      keyboardWillHide,
      keyboardAnimationDuration,
      screenY,
    } = this.state;

    return children({
      keyboardHeight,
      keyboardVisible,
      keyboardWillShow,
      keyboardWillHide,
      keyboardAnimationDuration,
      screenY,
    });
  }
}
