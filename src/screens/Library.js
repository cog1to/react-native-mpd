import React from 'react'
import {
    StyleSheet,
    View,
} from 'react-native'

// Redux.
import { connect } from 'react-redux'

// Actions.
import { loadLibrary } from '../redux/reducers/library/actions'

class Library extends React.Component {

    componentDidMount() {
        const { content, loadLibrary } = this.props

        if (content === null) {
            loadLibrary()
        }
    }

    render() {
        return (
            <View style={styles.container}>
            </View>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        content: state.library,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        loadLibrary: () => dispatch(loadLibrary())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Library)

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

