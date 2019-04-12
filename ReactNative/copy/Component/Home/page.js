import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	Image,
	ListView,
	TouchableOpacity,
} from 'react-native';
let Dimensions = require('Dimensions');
let {width} = Dimensions.get('window');

class Page extends React.Component{
	getDefaultProps(){
		return {
			ds: []
		}
	}
	constructor(props){
		super(props);
		let ds = new ListView.DataSource({
			rowHasChanged:(row1, row2)=>row1!=row2,
		})
		this.state = {
			ds: ds.cloneWithRows(this.props.ds),
		}
	}
	render(){
		return <ListView
			contentContainerStyle={styles.container}
			dataSource={this.state.ds}
			renderRow={this.renderRow}
			scrollEnabled={false}
		/>
	}
	press = ()=>{
		alert('pressed');
	}
	renderRow = (rowData)=>{
		return <TouchableOpacity onPress={this.press}>
			<View style={styles.row}>
				<Image source={{uri: rowData.icon}} style={styles.icon}/>
				<Text>{rowData.title}</Text>
			</View>
		</TouchableOpacity>
	}
}

const styles = StyleSheet.create({
	container:{
		flexDirection: 'row',
		flexWrap: 'wrap',
		width: width,
		justfiyContent: 'center'
	},
	row: {
		width: 70,
		height: 70,
		justfiyContent: 'center',
		alignItems: 'center',
	},
	icon: {
		width: 52,
		height: 52,
	}
});
export default Page;