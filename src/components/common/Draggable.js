import React from 'react'
import PropTypes from 'prop-types'
import {
    PanResponder,
} from 'react-native'

export default class Draggable extends React.Component {
    static propTypes = {
        children: PropTypes.func.isRequired,
        onTouchStart: PropTypes.func,
        onTouchMove: PropTypes.func,
        onTouchEnd: PropTypes.func,
        onShouldHandle: PropTypes.func,
        enabled: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this.state = {
            dragging: false,
        }

        this.panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: this.handleMoveShouldSetPanResponder,
            onPanResponderGrant: this.handlePanResponderGrant,
            onPanResponderMove: this.handlePanResponderMove,
            onPanResponderRelease: this.handlePanResponderEnd,
            onPanResponderTerminate: this.handlePanResponderEnd,
        })
    }

    handleStartShouldSetPanResponder = (event, gestureState) => {
        const { enabled } = this.props
        return enabled
    }

    handleMoveShouldSetPanResponder = (event, gestureState) => {
        const { enabled, onShouldHandle } = this.props
        return enabled && onShouldHandle({ top: gestureState.dy, left: gestureState.dx })
    }

    handlePanResponderGrant = () => {
        const { onTouchStart } = this.props
        
        this.setState({ dragging: true })
        
        onTouchStart()
    }

    handlePanResponderMove = (e, gestureState) => {
        const { onTouchMove } = this.props

        const offset = {
            top: gestureState.dy,
            left: gestureState.dx,
        }

        onTouchMove(offset)
    }

    handlePanResponderEnd = (e, gestureState) => {
        const { onTouchEnd, onTouchMove } = this.props

        const offset = {
            top: gestureState.dy,
            left: gestureState.dx,
        }

        this.setState({
            dragging: false,
        })

        onTouchMove(offset)
        onTouchEnd(offset, gestureState.vx)
    }

    render() {
        const { children } = this.props
        const { dragging } = this.state

        return children({
            handlers: this.panResponder.panHandlers,
            dragging,
        })
    }
}