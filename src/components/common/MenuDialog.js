import React from 'react'
import {
    View,
    Text,
    TouchableHighlight,
    StyleSheet,
    TouchableWithoutFeedback,
} from 'react-native'
import PropTypes from 'prop-types'

// Theme manager.
import ThemeManager from '../../themes/ThemeManager'

export default class MenuDialog extends React.Component {
    static propTypes = {
        options: PropTypes.arrayOf(PropTypes.shape({
            value: PropTypes.any,
            title: PropTypes.string,
        })).isRequired,
        onHide: PropTypes.func.isRequired,
        onOptionSelected: PropTypes.func.isRequired,
        title: PropTypes.string,
        selected: PropTypes.any,
    }
    
    static defaultProps = {
        title: null,
        selected: null
    }

    render() {
        const { options, title, selected } = this.props

        return ( 
            <TouchableWithoutFeedback onPress={this.handleOutPress}>
                <View style={styles.menuWrapper}>
                    <View style={styles.menuContainer}>
                        <Text style={styles.header}>{title}</Text>
                        {options.map(opt => {
                            return (
                                <TouchableHighlight key={opt.value} onPress={() => this.handleOnPress(opt)}>
                                    <Text style={selected == opt.value ? styles.selected : styles.option}>
                                        {opt.title}
                                    </Text>
                                </TouchableHighlight>
                             ) 
                        })}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        )
    }

    handleOnPress = (opt) => {
        this.props.onOptionSelected(opt)
    }

    handleOutPress = () => {
        this.props.onHide()
    }
}

const styles = StyleSheet.create({
   header: {
        fontSize: 18,
        fontWeight: 'bold',
        color: ThemeManager.instance().getCurrentTheme().mainTextColor,
        margin: 15,
        marginBottom: 20,
        textAlign: 'center',
    },
    option: {
        color: ThemeManager.instance().getCurrentTheme().mainTextColor,
        fontSize: 16,
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    selected: {
        color: ThemeManager.instance().getCurrentTheme().mainTextColor,
        fontSize: 16,
        paddingHorizontal: 20,
        paddingVertical: 15,
        fontWeight: 'bold',
    },
    menuContainer: {
        backgroundColor: ThemeManager.instance().getCurrentTheme().backgroundColor,
        shadowColor: 'black',
        shadowRadius: 10,
        shadowOpacity: 0.5,
        elevation: 10, 
        minWidth: '50%',
    },
    menuWrapper: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: ThemeManager.instance().getCurrentTheme().dialogBackgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
