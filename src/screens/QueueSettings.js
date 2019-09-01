import React from 'react'
import {
    View,
    StyleSheet,
    Switch,
    Text,
    TouchableHighlight,
    ScrollView,
    TouchableWithoutFeedback,
    Slider,
    Platform,
    UIManager,
    LayoutAnimation,
    BackHandler,
} from 'react-native'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

// Queue settings actions.
import { 
    setConsume,
    setRepeat,
    setRandom,
    crossfade,
    setSingle,
    setReplayGain,
} from '../redux/reducers/player/actions'

// Replay gain status actions.
import {
    getReplayGainStatus,
} from '../redux/reducers/status/actions'

// Queue options.
import { REPLAY_GAIN, REPLAY_GAIN_TITLES, SINGLE, SINGLE_TITLES } from '../utils/QueueOptions.js'

// On-screen list menu/dialog.
import MenuDialog from '../components/common/MenuDialog'

// Themes.
import ThemeManager from '../themes/ThemeManager'

// Shadow style that works on both iOS and Android.
import { elevationShadowStyle } from '../utils/Styles'

// Enable animations on Android.
if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Fade animations for options lists.
const FadeLayoutAnimation = {
    duration: 250,
    create: {
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
    },
    delete: {
       property: LayoutAnimation.Properties.opacity,
       type: LayoutAnimation.Types.easeOut,
    },
}

class ToggleRow extends React.Component {
    handleOnPress = () => {
        const { onTapped } = this.props
        onTapped()
    }

    static defaultProps = {
        lastRow: false,
    }

    render() {
        const { title, subtitle, value, lastRow } = this.props

        const theme = ThemeManager.instance().getCurrentTheme()

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
                            <Text style={styles.title}>{title}</Text>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <Text style={styles.subtitle}>{subtitle}</Text>
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

class SliderRow extends React.Component {
    state = {
        dragging: false,
        value: null,
    }

    static defaultProps = {
        lastRow: false,
    }

    onValueChange = (value) => {
        this.setState({
            dragging: true,
            value
        })
    }

    onSlidingComplete = () => {
        const { value } = this.state
        const { onNewValue } = this.props

        this.setState({
            dragging: false,
        })

        onNewValue(value)
    }

    render() {
        const { title, value, lastRow } = this.props
        const { value: newValue } = this.state

        const displayValue = newValue != null ? newValue : value

        const theme = ThemeManager.instance().getCurrentTheme()

        let style = styles.rowSlider
        if (!lastRow) {
            style = {...style, ...styles.bottomBorder}
        }

        return (
            <View style={styles.row}>
                <View style={style}>
                    <Text style={{...styles.title, marginBottom: 8}}>{title + ': ' + displayValue + 's'}</Text>
                    <Slider 
                        style={{marginLeft: Platform.OS === 'android' ? -10 : -2}} 
                        minimumValue={0.0}
                        maximumValue={60.0} 
                        step={1}
                        value={displayValue}
                        onValueChange={this.onValueChange}
                        onSlidingComplete={this.onSlidingComplete}
                        minimumTrackTintColor={theme.activeColor}
                        thumbTintColor={theme.accentColor}
                    />            
                </View>
            </View>
        )
    }
}

class OptionsRow extends React.Component {
    handleOnPress = () => {
        const { onTapped } = this.props
        onTapped()
    }

    static defaultProps = {
        lastRow: false,
    }

    render() {
        const { title, subtitle, value, lastRow } = this.props

        let style = styles.rowContent
        if (!lastRow) {
            style = {...style, ...styles.bottomBorder}
        }

        return (
            <TouchableHighlight 
                onPress={this.handleOnPress} 
                underlayColor='#DDDDDD'>
                <View style={styles.row}>
                    <View style={style}>
                        <View style={styles.rowText}>
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.subtitle}>{subtitle}</Text>
                        </View>
                        <View pointerEvents='none' style={styles.switchContainer}>
                            <Text style={styles.title}>{value}</Text>
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
        )
    }
}

class QueueSettings extends React.Component {
    state = {
        showingReplayGainModes: false,
        showingSingleModes: false,
    }

    render() {
        const { consume, random, repeat, single, crossfade, replayGain } = this.props
        const { showingReplayGainModes, showingSingleModes } = this.state

        const singleValue = SINGLE_TITLES.find(el => { return el.value == single })
        const replayValue = REPLAY_GAIN_TITLES.find(el => { return el.value == replayGain })

        return (
            <View style={{flex: 1}}>
                <ScrollView style={styles.container}>
                    <View style={styles.rowGroup}>
                        <ToggleRow 
                            title='Consume'
                            subtitle='Remove songs from queue when they finish'
                            onTapped={this.handleConsumeChange}
                            value={consume}
                        />
                        <ToggleRow
                            title='Shuffle'
                            subtitle='Randomize play order'
                            onTapped={this.handleRandomChange}
                            value={random}
                        />
                        <ToggleRow
                            title='Repeat'
                            subtitle='Repeat playback'
                            onTapped={this.handleRepeatChange}
                            value={repeat}
                        />
                        <OptionsRow
                            title='Single mode'
                            subtitle='Stop playback after each song'
                            onTapped={this.handleSingleChange}
                            value={singleValue.title}
                            lastRow={true}
                        />
                    </View>
                    <View style={styles.rowGroup}>
                        <SliderRow
                            title='Crossfade'
                            value={crossfade}
                            onNewValue={this.handleCrossfadeChange}
                        />
                        <OptionsRow
                            title='Replay gain mode'
                            subtitle='Normalize volume across songs'
                            onTapped={this.handleReplayGainChange}
                            value={replayValue.title}
                            lastRow={true}
                        />
 
                    </View>
                </ScrollView>
                {showingReplayGainModes && (
                    <MenuDialog
                         title='Replay gain mode'
                         options={REPLAY_GAIN_TITLES}
                         selected={replayValue.value}
                         onHide={this.handleBackPress}
                         onOptionSelected={this.handleReplayGainValue}
                    />
                )}
                {showingSingleModes && (
                    <MenuDialog
                         title='Single mode'
                         options={SINGLE_TITLES}
                         selected={singleValue.value}
                         onHide={this.handleBackPress}
                         onOptionSelected={this.handleSingleValue}
                    />
                )}
            </View>
       )
    }

    handleConsumeChange = () => {
        const { setConsume, consume } = this.props
        this.toggleValue(setConsume, consume)
    }

    handleRepeatChange = () => {
        const { setRepeat, repeat } = this.props
        this.toggleValue(setRepeat, repeat)
    }

    handleRandomChange = () => {
        const { setRandom, random } = this.props
        this.toggleValue(setRandom, random)
    }

    handleCrossfadeChange = (value) => {
        const { setCrossfade } = this.props
        setCrossfade(value)
    }

    handleSingleChange = () => {
        LayoutAnimation.configureNext(FadeLayoutAnimation)
        this.setState({
            showingSingleModes: true,
        })
    }

    handleSingleValue = (opt) => {
        LayoutAnimation.configureNext(FadeLayoutAnimation)
        const { setSingle } = this.props
        setSingle(opt.value)
        this.setState({
            showingSingleModes: false,
        })
    }

    handleReplayGainChange = () => {
        LayoutAnimation.configureNext(FadeLayoutAnimation)
        this.setState({
            showingReplayGainModes: true,
        })
    }

    handleReplayGainValue = (opt) => {
        LayoutAnimation.configureNext(FadeLayoutAnimation)
        const { setReplayGain } = this.props
        setReplayGain(opt.value)
        this.setState({
            showingReplayGainModes: false,
        })
    }

    handleBackPress = () => {
        const { showingSingleModes, showingReplayGainModes } = this.state

        if (showingSingleModes || showingReplayGainModes) {
            LayoutAnimation.configureNext(FadeLayoutAnimation)
            this.setState({
                showingSingleModes: false,
                showingReplayGainModes: false,
            })
            return true
        }

        return false
    }

    toggleValue = (method, value) => {
        method(value == 0 ? true : false)
    }

    componentDidMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
        }

        this.props.getReplayGain()
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
        }
    }

}

const mapStateToProps = state => {
    const { consume, random, repeat, single, crossfade, replayGain } = state.status
    return { consume, random, repeat, single, crossfade, replayGain }
}

const mapDispatchToProps = dispatch => ({
    setConsume: (value) => dispatch(setConsume(value)),
    setRepeat: (value) => dispatch(setRepeat(value)),
    setRandom: (value) => dispatch(setRandom(value)),
    setCrossfade: (value) => dispatch(crossfade(value)),
    setSingle: (value) => dispatch(setSingle(value)),
    getReplayGain: () => dispatch(getReplayGainStatus()),
    setReplayGain: (value) => dispatch(setReplayGain(value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(QueueSettings)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ThemeManager.instance().getCurrentTheme().tableBackgroundColor,
    },
    rowGroup: {
        ...elevationShadowStyle(2),
        marginVertical: 10,
        marginTop: 20,
        flexDirection: 'column',
        backgroundColor: ThemeManager.instance().getCurrentTheme().backgroundColor,
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
        fontWeight: 'bold',
        fontSize: ThemeManager.instance().getCurrentTheme().mainTextSize,
        color: ThemeManager.instance().getCurrentTheme().mainTextColor,
        marginBottom: Platform.OS === 'android' ? 0 : 2,
    },
    subtitle: {
        fontSize: ThemeManager.instance().getCurrentTheme().subTextSize,
        color: ThemeManager.instance().getCurrentTheme().lightTextColor,
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
