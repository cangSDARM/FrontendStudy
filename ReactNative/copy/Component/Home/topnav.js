import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	Image,
	ScrollView,
	ListView
} from 'react-native';
import Page from './page';

let Dimensions = require('Dimensions');
let {width} = Dimensions.get('window');
let rows = 5;

class Top extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			activepage: 0
		}
	}
	render(){
		return <View style={styles.container}>
			<ScrollView
				horizontal={true}
				pagingEnabled={true}
				showHorizontalScrollIndicator={false}
				onMomentumScrollEnd = {this.onScrollEnd}
			>
				{this.renderPage()}
			</ScrollView>
			<View style={styles.indicator}>
				{this.renderIndicator()}
			</View>
		</View>
	}
	items = [
		{
			title: '0',
			icon: 'zuliao_circle',
		},{
			title: '0',
			icon: 'zuliao_circle',
		},{
			title: '0',
			icon: 'zuliao_circle',
		},{
			title: '0',
			icon: 'zuliao_circle',
		},{
			title: '0',
			icon: 'zuliao_circle',
		},{
			title: '0',
			icon: 'zuliao_circle',
		},{
			title: '0',
			icon: 'zuliao_circle',
		},{
			title: '0',
			icon: 'zuliao_circle',
		},{
			title: '0',
			icon: 'zuliao_circle',
		}
	]
	renderPage = ()=>{
		let arr = [];
		for(let i=0; i<Math.ceil(items/rows);i++){
			arr.push(
				<View key={i} style={styles.page}>
					<Page ds={()=>{
						let ds = [];
						for(let j=0; j<items.length; j++){
							if(j/rows===i+1){
								return ds;
							}else{
								ds.push(items[i]);
							}
						}
					}}/>
				</View>
			)
		}
		return arr;
	}
	renderIndicator = ()=>{
		let indicatorA = [], style;
		for(let i=0; i<Math.ceil(items/rows); i++){
			style = i===this.state.activepage ? {color:'orange'} : {color: 'gray'}
			indicatorA.push(
				<Text key={i} style={[{fontSize: 20}, style]}>&bull;</Text>
			);
		}
		return indicatorA;
	}
	onScrollEnd = (e)=>{
		let currentP = Math.floor(e.nativeEvent.contentOffset.x / width);
		this.setState({
			activepage: currentP
		});
	}
}

const styles = StyleSheet.create({
	container:{

	},
	page: {
		width: '100%',
		height: 120
	},
	indicator: {
		flexDirection: 'row',
		justfiyContent: 'center',
	}
});
export default Top;