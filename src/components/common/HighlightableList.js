import React from 'react'
import {
    View,
    FlatList,
    TouchableWithoutFeedback,
    StyleSheet,
    Animated,
} from 'react-native'
import PropTypes from 'prop-types'

class HighlightableItem extends React.Component {
    
    state = {
        pressed: false,
    }
    
    constructor(props) {
        super(props)
        this.animatedValue = new Animated.Value(0)
        this.animating = false
    }

    static propTypes = {
        highlightColor: PropTypes.string.isRequired,
        baseColor: PropTypes.string.isRequired,
        duration: PropTypes.number.isRequired,
        onPress: PropTypes.func.isRequired,
        onPressIn: PropTypes.func.isRequired,
    }

    static defaultProps = {
        highlightColor: '#aaaaaa',
        baseColor: '#ffffff',
        duration: 250,
    }

    deselect = () => {
        this.setState({
            pressed: false,
        })
    }

    select = () => {
        this.setState({
            pressed: true,
        })
    }

    handlePressIn = () => {
        this.props.onPressIn(this.deselect)

        this.setState({
            pressed: true,
        })
    }

    handlePressOut = () => {
        this.setState({
            pressed: false,
        })
    }

    handlePress = () => {
        const { id, onPress } = this.props
        onPress(id)
    }

    handleLongPress = () => {
        const { id, onLongPress } = this.props
        onLongPress(id)
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextState.pressed || nextProps.selected) {
            console.log('*** ' + this.props.id + ' selected')
            this.animatedValue.setValue(1)
        } else {
            console.log('*** ' + this.props.id + ' deselected')
            this.animateBackground(0)
        }
    }

    onAnimationEnded = (endValue) => {
        if ((this.state.pressed || this.props.selected) && endValue == 0) {
            this.animateBackground(1)
        } else if (!(this.state.pressed || this.props.selected) && endValue == 1) {
            this.animateBackground(0)
        } else {
            this.animating = false
        }
    }
    
    animateBackground = (endValue) => {
        const { duration } = this.props
        
        this.animating = true
        Animated.timing(
            this.animatedValue,
            {
                toValue: endValue,
                duration: duration/2,
            }
        ).start(() => this.onAnimationEnded(endValue))
    }

    render() {
        const { baseColor, highlightColor } = this.props

        const backgroundColorValue = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [baseColor, highlightColor]
        })

        return (
            <TouchableWithoutFeedback
                onPressIn={this.handlePressIn}
                onPressOut={this.handlePressOut}
                onPress={this.handlePress}
                onLongPress={this.handleLongPress}
            >
                <Animated.View style={this.props.style, { backgroundColor: backgroundColorValue }}>
                    {React.cloneElement(this.props.children, { select: this.select, deselect: this.deselect })}
                </Animated.View>
            </TouchableWithoutFeedback>
        )
    }
}

export default class HighlightableList extends React.Component {

    static defaultProps = {
        onItemSelected: (item, deselect) => {
            deselect()
        },
    }

    handleOnSelected = (id, deselect) => {
        if (this.scrolling) {
            deselect()
            return
        }

        const { keyExtractor, data } = this.props
        const item = data.filter(item => {
            return keyExtractor(item) === id 
        })[0]

        this.props.onItemSelected(item, deselect)
    }

    handlePressIn = (deselect) => {
        this.deselect = deselect
    }

    handleLongPress = (id, deselect) => {
        if (this.scrolling) {
            deselect()
            return
        }

        const { keyExtractor, data } = this.props
        const item = data.filter(item => {
            return keyExtractor(item) === id 
        })[0]

        this.props.onItemLongPress(item, deselect)
    }

    handleScrollBegin = () => {
        this.deselect()
    }

    scrollToOffset = (config) => {
        this.ref.scrollToOffset(config)
    }

    renderItem = ({item}) => {
        const { keyExtractor } = this.props

        return (
            <HighlightableItem
                id={keyExtractor(item)}
                onPress={this.handleOnSelected}
                onPressIn={this.handlePressIn}
                onLongPress={this.handleLongPress}>
                {this.props.renderItem({ item })}
            </HighlightableItem>
        )        
    }

    render() {
        return (
            <FlatList
                ref={(component) => {this.ref = component}}
                {...this.props}
                renderItem={this.renderItem}
                onScrollBeginDrag={this.handleScrollBegin}
            />
        )
    }
}

