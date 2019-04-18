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
    
    constructor(props) {
        super(props)
        this.animatedValue = new Animated.Value(0)
    }

    static propTypes = {
        highlightColor: PropTypes.string.isRequired,
        baseColor: PropTypes.string.isRequired,
        duration: PropTypes.number.isRequired,
        onPress: PropTypes.func.isRequired,
        selected: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        highlightColor: '#aaaaaa',
        baseColor: '#ffffff',
        duration: 150,
        selected: false,
    }

    handlePressIn = () => {
        this.animateBackground(1)
    }

    handlePressOut = () => {
        if (!this.props.selected) {
            this.animateBackground(0)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.id !== this.props.id
    }

    onAnimationEnded = () => {
        if (this.props.selected && this.animatedValue.getValue() == 0) {
            this.animateBackground(0)
        } else if (!this.props.selected && this.animatedValue.getValue() == 1) {
            this.animateBackground(1)
        }
    }
    
    animateBackground = (endValue) => {
        const { duration } = this.props

        Animated.timing(
            this.animatedValue,
            {
                toValue: endValue,
                duration: duration/2,
            }
        ).start(this.onAnimationEnded)
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
                onPress={this.props.onPress}
            >
                <Animated.View style={this.props.style, { backgroundColor: backgroundColorValue }}>
                    {this.props.children}
                </Animated.View>
            </TouchableWithoutFeedback>
        )
    }
}

export default class HighlightableList extends React.Component {

    static defaultProps = {
        onItemSelected: (item) => {},
        selected: [],
    }

    handleOnSelected = (item) => {
        this.props.onItemSelected(item) 
    }

    renderItem = ({item}) => {
        const { keyExtractor } = this.props.keyExtractor
        const isSelected = selected.includes(keyExtractor(item))

        return (
            <HighlightableItem
                id={keyExtractor(item)}
                selected={isSelected}
                onPress={this.handleOnSelected}
            >
                {this.props.renderItem(item)}
            </HighlightableItem>
        )        
    }

    render() {
        return (
            <FlatList
                {...this.props}
                renderItem={this.renderItem}
            />
        )
    }
}

const styles = StyleSheet.create({

})
