import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	Image,
	TouchableOpacity
} from 'react-native';

class Header extends React.Component{
	render(){
		return <View style={styles.container}>
			{this.renderTop()}
			{this.renderBottom()}
		</View>
	}
	press = ()=>{
		alert('pressed');
	}
	renderTop = ()=>{
		return <View style={styles.top}>
			<TouchableOpacity onPress={this.press}>
				<Image source={{uri: 'usr_avatar'}} style={styles.avatar}/>
			</TouchableOpacity>
			<View>
				<TouchableOpacity onPress={this.press}>
					<Text style={{fontSize:18, fontWeight:'blod'}}>User</Text>
					<Image source={{uri: 'usr_vip'}} style={{width: 16, height: 16}}/>
				</TouchableOpacity>
			</View>
			<TouchableOpacity>
				<Image source={{uri: 'arrow_to_right'}} style={{width:8, height: 13, marginRight:8}}/>
			</TouchableOpacity>
		</View>
	}
	bottomitems = [
		{
			title: '1',
			num: 100,
		},{
			title: '2',
			num: 100,
		},{
			title: '3',
			num: 100,
		}
	]
	renderBottom = ()=>{
		return <View style={styles.bottom}>
		{
			this.bottomitems.map((item, index)=>{
				return <View style={styles.bitem} key={index}>
					<TouchableOpacity onPress={this.press}>
						<Text>{item.num}</Text>
						<Text>{item.title}</Text>
					</TouchableOpacity>
				</View>
			})
		}
		</View>
	}
}

const styles = StyleSheet.create({
	top:{
		flexDirection: 'row'
		alignItems: 'center',
		justfiyContent: 'space-around',
	},
	avatar: {
		width: 70,
		height: 70,
	},
	bottom: {
		flexDirection: 'row',
		height: 40,
		position: 'absolute',
		bottom: 0
	},
	bitem: {
		justfiyContent: 'center',
		alignItems: 'center',
		fontSize: 18,
		backgroundColor: 'rgba(255, 96, 0, 0.6)',
		borderLeft: '1px solid white',
		borderRight: '1px solid white',
		width: '25%',
		height: '100%',
		color: 'white',
	}
});
export default Header;