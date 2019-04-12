import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	Image
} from 'react-native';

class Order extends React.Component{
	order = [
		{
			img: 'wait_pay',
			title: 'Wait Payment'
		},{
			img: 'wait_use',
			title: 'Wait Use'
		},{
			img: 'wait_evaluate',
			title: 'Wait Evaluate'
		},{
			img: 'after_sale',
			title: 'After Sale'
		}
	]
	render(){
		return <View style={styles.container}>
			{
				this.order.map((item, index)=>{
					return <TouchableOpacity onPress={this.press} key={index}>
						<View style={styles.orderitem}>
							<Image source={{uri: item.img}} style={styles.orderimg}/>
							<Text>{item.title}</Text>
						</View>
					</TouchableOpacity>
				})
			}
		</View>
	}
	press = ()=>{}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		height: 50,
		justifyContent: 'center',
		flexWarp: 'nowarp',
	},
	orderitem:{
		height: 45,
		width: '20%',
		alignItems: 'center',
		justifyContent: 'center',
		textAlgin: 'center',
		fontSize: 14
	},
	orderimg: {
		width: 25,
		height: 20,
	}
});
export default Order;