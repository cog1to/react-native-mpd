import React from 'react'
import { 
    View, 
    StyleSheet,
} from 'react-native'

import QueueList from '../components/QueueList'

export default class Queue extends React.Component {
	render() {
		return (
			<View style={styles.container}>
				<QueueList />
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
})
