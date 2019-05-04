import React from 'react'
import {
    View,
    ScrollView,
    Button,
    StyleSheet,
} from 'react-native'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { search } from '../redux/reducers/search/actions'

// Input control.
import Input from '../components/common/Input'

Fields = [
    { ID: 'TITLE', title: 'Title', tag: 'title', },
    { ID: 'ARTIST', title: 'Artist', tag: 'artist', },
    { ID: 'ALBUM', title: 'Album', tag: 'album', },
    { ID: 'ALBUM_ARTIST', title: 'Album Artist', tag: 'albumartist', },
    { ID: 'YEAR', title: 'Year', tag: 'date', },
    { ID: 'GENRE', title: 'Genre', tag: 'genre', },
    { ID: 'FILENAME', title: 'Filename', tag: 'filename', },
]

class Search extends React.Component {

    state = { }

    shouldComponentUpdate(nextProps, nextState) {
        const { navigation: { navigate } } = this.props
        const { results } = nextProps

        if (results.length > 0) {
            console.log('showing search results')
            return false
        }

        return true
    }

    onChangeText = (text, fieldId) => {
        let newState = Object.assign({}, this.state)
        newState[fieldId] = text
        this.setState(newState)
    }

    onSearch = () => {
        const { doSearch } = this.props
        const tags = this.state

        const nonEmptyTags = Object.keys(tags).filter((key) => {
            return (key in tags) && tags[key] !== null && tags[key].length > 0
        })

        const total = nonEmptyTags.map(tag => {
            return { tag: tag, value: tags[tag] }
        })

        doSearch(total)
    }

    render() {
        return (
            <View style={styles.container}>
                <ScrollView>
                    {Fields.map(({ ID, title, tag }) => {
                        return (
                            <Input 
                                key={ID}
                                placeholder={title}
                                onChangeText={(text) => this.onChangeText(text, tag)}
                                value={this.state[tag]}
                            />
                        )
                    })}
                   <View style={styles.search}>
                        <Button title="Search" onPress={this.onSearch} />
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
    console.log(JSON.stringify(results))

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

