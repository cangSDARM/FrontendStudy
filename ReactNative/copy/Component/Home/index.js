import React from 'react';
import {
	StyleSheet,
	View,
	Text,
	ScrollView,
	TouchableOpacity
} from 'react-native';

import Nav from './nav';
import Top from './topnav';

class Main extends React.Component{

	render(){
		return <View style={styles.container}>
			<Nav />
			<ScrollView>
				<Top />
			</ScrollView>
		</View>
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
})

export default Main;