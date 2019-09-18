import React from 'react'
import {
    View,
    ScrollView,
    Button,
    StyleSheet,
    Platform,
} from 'react-native'
import PropTypes from 'prop-types'
import { NavigationActions } from 'react-navigation'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { search } from '../redux/reducers/search/actions'

// Input control.
import Input from '../components/common/Input'

// Keyboard state listener.
import KeyboardState from '../components/common/KeyboardState'

// Themes.
import ThemeManager from '../themes/ThemeManager'

// Safe area check.
import { isIphoneX } from '../utils/IsIphoneX';

Fields = [
    { ID: 'TITLE', title: 'Title', tag: 'title', },
    { ID: 'ARTIST', title: 'Artist', tag: 'artist', },
    { ID: 'ALBUM', title: 'Album', tag: 'album', },
    { ID: 'ALBUM_ARTIST', title: 'Album Artist', tag: 'albumartist', },
    { ID: 'YEAR', title: 'Year', tag: 'date', },
    { ID: 'GENRE', title: 'Genre', tag: 'genre', },
    { ID: 'FILENAME', title: 'Filename', tag: 'filename', },
]

class KeyboardAwareSearchForm extends React.Component {
    state = {
        layout: null,
    }

    static propTypes = {
        // From `KeyboardState`
        keyboardHeight: PropTypes.number.isRequired,
        keyboardVisible: PropTypes.bool.isRequired,
        keyboardWillShow: PropTypes.bool.isRequired,
        keyboardWillHide: PropTypes.bool.isRequired,
        keyboardAnimationDuration: PropTypes.number.isRequired,
        screenY: PropTypes.number.isRequired,

        // Rendering content
        children: PropTypes.node,
    }

    static defaultProps = {
        children: null,
    }

    handleLayout = event => {
        const { nativeEvent: { layout } } = event

        if (this.state.layout == null) {
            this.setState({
                layout,
            })
        }
    }

    render() {
        const { layout } = this.state

        const {
            children,
            keyboardHeight,
            keyboardVisible,
            keyboardAnimationDuration,
            keyboardWillShow,
            keyboardWillHide,
            screenY,
        } = this.props

        const containerStyle = (Platform.OS === 'ios' && layout != null)
            ? { height: keyboardVisible ? (screenY - layout.y - 60) : layout.height } 
            : { }
        
        return (
            <View style={containerStyle} onLayout={this.handleLayout}>
                {children}
            </View>
        )
    }
}

class Search extends React.Component {
    state = { 
        dirty: false,
        criteria: {},
    }

    showResults = (content) => {
        const { navigation } = this.props

        const action = NavigationActions.navigate({
            params: {
                content: content,
            },
            routeName: 'SearchResults',
        })
        navigation.dispatch(action)
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        const { results } = nextProps

        if (!nextState.dirty && results != null) {
            this.showResults(results)
            return false
        }

        return true
    }

    onChangeText = (text, fieldId) => {
        let newCriteria = Object.assign({}, this.state.criteria)
        newCriteria[fieldId] = text
        this.setState({
            criteria: newCriteria,
            dirty: true,
        })
    }

    onSearch = () => {
        const { doSearch } = this.props
        const tags = this.state.criteria

        const nonEmptyTags = Object.keys(tags).filter((key) => {
            return (key in tags) && tags[key] !== null && tags[key].length > 0
        })

        const total = nonEmptyTags.map(tag => {
            return { tag: tag, value: tags[tag] }
        })
        
        this.setState({
            dirty: false,
        }, () => doSearch(total))
    }

    render() {
        const { criteria } = this.state
        const borderBottomColor = ThemeManager.instance().getCurrentTheme().accentColor

        return (
            <View style={styles.container}>
                <KeyboardState>
                    {keyboardInfo => (
                        <KeyboardAwareSearchForm {...keyboardInfo}>
                            <ScrollView keyboardShouldPersistTaps='always'>
                                {Fields.map(({ ID, title, tag }) => {
                                    return (
                                        <Input
                                            borderBottomColor={borderBottomColor}
                                            key={ID}
                                            placeholder={title}
                                            onChangeText={(text) => this.onChangeText(text, tag)}
                                            value={criteria[tag]}
                                        />
                                    )
                                })}
                               <View style={styles.search}>
                                    <Button 
                                        title="Search"
                                        onPress={this.onSearch}
                                        color={ThemeManager.instance().getCurrentTheme().accentColor}
                                    />
                                </View>
                            </ScrollView>
                        </KeyboardAwareSearchForm>
                    )}
                </KeyboardState>
            </View>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        doSearch: (expression) => {
            dispatch(search(expression))
        }
    }
}

const mapStateToProps = (state) => {
    const results = state.search

    return {
        results: results,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 5,
        paddingHorizontal: 20,
    },
    search: {
        marginTop: 10,
        alignSelf: 'flex-end',
    },
})

