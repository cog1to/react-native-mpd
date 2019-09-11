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

// Main screen features.
import MainScreen from './MainScreen'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { search } from '../redux/reducers/search/actions'

// Input control.
import Input from '../components/common/Input'
import KeyboardState from '../components/common/KeyboardState'
import MeasureLayout from '../components/common/MeasureLayout'

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

class SearchForm extends React.Component {
    static propTypes = {
        // From `KeyboardState`
        containerHeight: PropTypes.number.isRequired,
        contentHeight: PropTypes.number.isRequired,
        keyboardHeight: PropTypes.number.isRequired,
        keyboardVisible: PropTypes.bool.isRequired,
        keyboardWillShow: PropTypes.bool.isRequired,
        keyboardWillHide: PropTypes.bool.isRequired,
        keyboardAnimationDuration: PropTypes.number.isRequired,

        // Rendering content
        children: PropTypes.node,
    }

    static defaultProps = {
        children: null,
    }

    render() {
        const {
            children,
            containerHeight,
            contentHeight,
            keyboardHeight,
            keyboardVisible,
            containerY
        } = this.props

        const useContentHeight = keyboardVisible

        console.log('content = ' + contentHeight + ', container = ' + containerHeight + ', useContent = ' + useContentHeight + ', ly = ' + containerY)
        console.log(JSON.stringify(Platform))

        const containerStyle = { height: useContentHeight ? (contentHeight - (isIphoneX() ? 24 : 0)) : containerHeight, backgroundColor: 'blue' }
        
        return (
            <View style={containerStyle}>
                {children}
            </View>
        )
    }
}

class Search extends MainScreen {

    state = { 
        dirty: false,
        criteria: {},
    }

    componentDidMount() {
        super.componentDidMount()
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
                <MeasureLayout>
                    {layout => (
                        <KeyboardState layout={layout}>
                            {keyboardInfo => (
                                <SearchForm {...keyboardInfo}>
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
                                </SearchForm>
                            )}
                        </KeyboardState>
                    )}
                </MeasureLayout>
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
        backgroundColor: 'red',
        marginTop: 10,
        alignSelf: 'flex-end',
    },
})

