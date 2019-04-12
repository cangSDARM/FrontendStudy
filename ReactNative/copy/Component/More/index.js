import React from 'react';
import {
	StyleSheet,
	View,
	Text,
	Image,
	TouchableOpacity,
	SrollView
} from 'react-native';

import Cell from '../Util/cell';

class Main extends React.Component{

	render(){
		return <View style={styles.container}>
			{this.renderNav()}
			<SrollView>
				<View style={{margin:'5 0 10 0'}}>
					<Cell title="Scan It"/>
				</View>
				<View style={{margin:'5 0 10 0'}}>
					<Cell title="Save Flow" switch={true}/>
					<Cell title="Massage"/>
					<Cell title="Inviting"/>
					<Cell title="Clear Cache" text="1.2M"/>
				</View>
				<View style={{margin:'5 0 10 0'}}>
					<Cell title="FeedBack"/>
					<Cell title="Investigate"/>
					<Cell title="Help"/>
					<Cell title="About"/>
					<Cell title="NetWork"/>
					<Cell title="Apply"/>
				</View>
				<View style={{margin:'5 0 10 0'}}>
					<Cell title="Recommend App"/>
				</View>
			</SrollView>
		</View>
	}
	renderNav = ()=>{
		return <View style={styles.nav}>
			<Text>More</Text>
			<TouchableOpacity onPress={this.press}>
				<Image source={{uri: 'mine_setting'}} style={styles.navimg}/>
			</TouchableOpacity>
		</View>
	}
	press = ()=>{
		alert('Pressed');
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	nav:{
		height: 64,
		backgroundColor: 'rgba(255, 96, 0, 0.8)',
		flexDirection: 'row',
		alignItems: 'center',
		textAlign: 'center',
		justifyContent: 'space-around'
	},
	navimg: {
		width: 30,
		height: 30
	}
})

export default Main;