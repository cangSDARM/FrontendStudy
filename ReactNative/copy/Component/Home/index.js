import React from 'react';
import {
	StyleSheet,
	View,
	Text,
	TextInput,
	TouchableOpacity
} from 'react-native';
var Dimensions = require('Dimensions');
let {width, height} = Dimensions.get('window');

class Main extends React.Component{

	render(){
		return <View style={styles.container}>
			{this.renderNavbar()}
			<Text></Text>
		</View>
	}
	renderNavbar(){
		return <View style={styles.nav}>
			<TouchableOpacity onPress={this.press}>
				<Text>GuangZhou</Text>
			</TouchableOpacity>
			<TextInput
				placehoder="Shoper, Type, Ranger"
				style={styles.topinput}
			/>
			<View style={{flexDirection: 'row'}}>
				<TouchableOpacity onPress={this.press}>
					<Image source={require('./ring')} style={styles.icon}/>
				</TouchableOpacity>
				<TouchableOpacity onPress={this.press}>
					<Image source={require('./scan')} style={styles.icon}/>
				</TouchableOpacity>
			</View>
		</View>
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	nav: {
		height: 64,
		backgroundColor: 'rgba(255, 96, 0, 0.9)',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-around',
		padding: 2,
	}
	topinput: {
		width: width * 0.7,
		height: 38,
		backgroundColor: 'white',
		marginTop: 13,
		borderRadius: 10,
		padding: '0 10',
	},
	icon: {
		width: 30,
		height: 30
	}
})

export default Main;