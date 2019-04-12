import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	Image,
	TouchableOpacity,
	Switch
} from 'react-native';

class Cell extends React.Component{
	getDefaultProps(){
		return{
			title: '',
			switch: false,
			text: undefined,
			avatar: undefined,
		}
	}
	constructor(props){
		super(props);
		this.state = {
			switchValue: false
		}
	}
	render(){
		return <View style={styles.container}>
			<TouchableOpacity onPress={this.press}>
				<View>
					{ this.props.avatar && <Image source={{uri: this.props.avatar}} style={styles.avatar}/>}
					<Text>{this.props.title}</Text>
				</View>
				<View>
					{
						this.props.text && <Text>
							{this.props.text}
						</Text>
					}
					{
						this.props.switch
						?<Image source={{uri: 'arrow_to_right'}} style={styles.img}/>
						:<Switch value={this.state.switchValue} onValueChange={this.switchValueChange}/>
					}
				</View>
			</TouchableOpacity>
		</View>
	}
	press = ()=>{
		alert('pressed');
	}
	switchValueChange = ()=>{
		alert('switched');
		this.setState({
			switchValue: !this.state.switchValue,
		})
	}
}

const styles = StyleSheet.create({
	container:{
		height: 40,
		backgroundColor: 'rgba(255, 255, 255)',
		borderBottomColor: '#dddddd',
		borderBottomWidth: 0.5,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: '0 5',
	},
	avatar:{
		height: 35,
		width: 30,
	},
	img:{
		width: 8,
		height: 13
	}
});
export default Cell;