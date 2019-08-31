import React from 'react'
import {
    View,
    ScrollView,
    Button,
    StyleSheet,
} from 'react-native'
import { NavigationActions } from 'react-navigation'

// Main screen features.
import MainScreen from './MainScreen'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { search } from '../redux/reducers/search/actions'

// Input control.
import Input from '../components/common/Input'

// Themes.
import ThemeManager from '../themes/ThemeManager'

Fields = [
    { ID: 'TITLE', title: 'Title', tag: 'title', },
    { ID: 'ARTIST', title: 'Artist', tag: 'artist', },
    { ID: 'ALBUM', title: 'Album', tag: 'album', },
    { ID: 'ALBUM_ARTIST', title: 'Album Artist', tag: 'albumartist', },
    { ID: 'YEAR', title: 'Year', tag: 'date', },
    { ID: 'GENRE', title: 'Genre', tag: 'genre', },
    { ID: 'FILENAME', title: 'Filename', tag: 'filename', },
]

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

        return (
            <View style={styles.container}>
                <ScrollView>
                    {Fields.map(({ ID, title, tag }) => {
                        return (
                            <Input 
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

