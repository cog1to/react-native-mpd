import React from 'react'
import PropTypes from 'prop-types'
import { 
  View, 
  StyleSheet,
  Text,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  TouchableOpacity,
} from 'react-native'
import FontAwesome, { Icons } from 'react-native-fontawesome'
import Draggable from './common/Draggable'
import { Dimensions } from 'react-native'

// Vector icons.
import Icon from 'react-native-vector-icons/MaterialIcons'

// highlightable view.
import { HighlightableView } from './common/HighlightableView'

// Theming.
import ThemeManager from '../themes/ThemeManager'

class ForegroundView extends React.PureComponent {

    static propTypes = {
        name: PropTypes.string,
        id: PropTypes.string.isRequired,
        status: PropTypes.string,
        subtitle: PropTypes.string,
        height: PropTypes.number,
        onMenuPress: PropTypes.func.isRequired,
        editing: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        onMenuPress: () => {}
    }

    handleMenuPress = (id) => {
        const { onMenuPress } = this.props
        onMenuPress(id)
    }

    render() {
        const { status, subtitle, id, name, height, selected, onMenuPress, editing } = this.props
        const theme = ThemeManager.instance().getCurrentTheme()

        return (
            <View style={{...styles.container, height: height}}>
                {status !== null && (
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={[styles.status, styles.statusActive]}>
                            <FontAwesome>{status === 'play' ? Icons.play : Icons.pause  }</FontAwesome>
                        </Text>
                    </View>
                )}
                {status === null && (
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={[styles.status, styles.statusInactive]}>
                            {id}
                        </Text>
                    </View>
                )}
                <View style={styles.description}>
                    <Text
                        style={status === 'play' ? styles.titlePlay : styles.title}
                        ellipsizeMode='tail'
                        selectable={false}
                        numberOfLines={1}
                    >
                        {name}
                    </Text>
                    {subtitle && (<Text style={styles.subtitle}>{subtitle}</Text>)}
                </View>
                <View>
                    {selected && (
                        <Icon name='check' color={theme.mainTextColor} style={{...styles.status, fontSize: 20}} />
                    )}
                    {!selected && !editing && (
                        <TouchableOpacity onPress={() => this.handleMenuPress(id)}>
                            <Icon name='more-vert' color={theme.mainTextColor} style={{...styles.status, fontSize: 20}} />
                        </TouchableOpacity>
                    )}
                </View>

            </View>
        )
    } 
}

const HighlightableForegroundView = HighlightableView(ForegroundView)

export default class QueueListItem extends React.Component {
    constructor(props) {
        super(props)
        
        this.animatedValue = {
            left: new Animated.Value(0),
            leftOpacity: new Animated.Value(0),
            rightOpacity: new Animated.Value(0),
        }
    }

    onDelete = () => {
        const { item } = this.props
        this.props.onDeleteItem(item)
    }

    handleTouchStart = () => {
        // Nothing to do right now.
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.selected !== nextProps.selected) {
            return true
        }

        if (this.props.editing !== nextProps.editing) {
            return true
        }

        if (this.props.item.id !== nextProps.item.id) {
            return true
        }

        if (this.props.item.status !== nextProps.item.status) {
            return true
        }

        return false
    }

    handleShouldHandle = ({ top, left }) => {
        return (Math.abs(top) < 10 && Math.abs(left) > 10)
    }

    handleTouchMove = ({ top, left }) => {
        this.animatedValue.left.setValue(left)
        this.leftIcon.setNativeProps({ style: { opacity: (left > 0) ? 1.0 : 0.0 }})
        this.rightIcon.setNativeProps({ style: { opacity: (left > 0) ? 0.0 : 1.0 }})
    }

    handleTouchEnd = ({ top, left }, velocity) => {
        const width = Dimensions.get('window').width
        
        if (Math.abs(left) > width*0.25 || Math.abs(velocity) > 2.5) {
            Animated.spring(this.animatedValue.left, {
                toValue: (left > 0 ? width : (-width)),
                friction: 30,
                tension: 300,                
                useNativeDriver: true
            }).start(this.onDelete)
        } else {
            Animated.spring(this.animatedValue.left, {
                toValue: 0,
                friction: 30,
                tension: 300,
                useNativeDriver: true
            }).start()
        }
    }

    // Highlightable.
    
    handleTap = () => {
        const { item, onTap } = this.props
        onTap(item)
    }

    handleLongTap = () => {
        const { item, onLongTap } = this.props
        onLongTap(item)
    }

    // Menu.
    
    handleMenuPress = () => {
        const { item, onMenuPress } = this.props
        onMenuPress(item)
    }

    // Rendering.

    render() {
        const { item, subtitle, selected, editing } = this.props
        const { name, status, id } = item

        return (
            <View>
                <Draggable
                    enabled={true}
                    onTouchStart={() => this.handleTouchStart()}
                    onTouchMove={offset => this.handleTouchMove(offset)}
                    onTouchEnd={(offset, velocity) => this.handleTouchEnd(offset, velocity)}
                    onShouldHandle={(offset) => this.handleShouldHandle(offset)}>
                    {({ handlers, dragging }) => {
                        const style = {
                            transform: [
                                {
                                    translateX: this.animatedValue.left
                                }
                            ]
                        }

                        return (
                            <Animated.View {...handlers} style={[styles.foreground, style]}>
                                <HighlightableForegroundView
                                    onMenuPress={this.handleMenuPress}
                                    selected={selected}
                                    editing={editing}
                                    item={item}
                                    name={name}
                                    status={status}
                                    id={id}
                                    subtitle={subtitle}
                                    onTap={this.handleTap}
                                    onLongTap={this.handleLongTap}
                                />
                            </Animated.View>
                        )
                    }}
                </Draggable>
                <View style={styles.background}>
                    <View style={styles.centeredTextContainer}>
                        <Text style={styles.deleteText} ref={component => this.leftIcon = component}>
                            <FontAwesome>{Icons.trash}</FontAwesome>
                        </Text>
                    </View>
                    <View style={styles.centeredTextContainer}>
                        <Text style={styles.deleteText} ref={component => this.rightIcon = component}>
                            <FontAwesome>{Icons.trash}</FontAwesome>
                        </Text>
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        marginVertical: 8,
    },
    status: {
        width: 60,
        textAlign: 'center',
        alignSelf: 'stretch',
        textAlignVertical: 'center',
        fontSize: 12,
    },
    statusActive: {
        color: ThemeManager.instance().getCurrentTheme().activeColor,
    },
    statusInactive: {
        color: ThemeManager.instance().getCurrentTheme().lightTextColor,
    },
    description: {
        flex: 1,
        flexDirection: 'column',
        marginRight: 10,
    },
    title: {        
        fontWeight: Platform.OS === 'android' ? 'normal' : '500',
        fontSize: ThemeManager.instance().getCurrentTheme().mainTextSize,
        color: ThemeManager.instance().getCurrentTheme().mainTextColor,
        marginBottom: Platform.OS === 'android' ? 0 : 2,
    },
    titlePlay: {        
        fontWeight: 'bold',
        fontSize: ThemeManager.instance().getCurrentTheme().mainTextSize,
        color: ThemeManager.instance().getCurrentTheme().mainTextColor,
        marginBottom: Platform.OS === 'android' ? 0 : 2,
    },
    subtitle: {
        fontSize: ThemeManager.instance().getCurrentTheme().subTextSize,
        color: ThemeManager.instance().getCurrentTheme().lightTextColor,
    },
    foreground: {
        zIndex: 2, 
        backgroundColor: ThemeManager.instance().getCurrentTheme().backgroundColor,
    },
    background: {
        zIndex: 1,
        position: 'absolute',
        height: '100%',
        width: '100%',
        backgroundColor: ThemeManager.instance().getCurrentTheme().accentBackgroundColor,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    centeredTextContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        aspectRatio: 1.5
    },
    deleteText: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        textAlignVertical: 'center',
        alignSelf: 'stretch',
    }
})
