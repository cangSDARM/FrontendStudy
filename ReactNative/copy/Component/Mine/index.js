import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	Image,
	ScrollView
} from 'react-native';

import Cell from '../Util/cell';
import Order from './order';
import Header from './header';

class Mine extends React.Component{
	render(){
		return <View style={styles.container}>
			<Header />
			<View>
				<Cell title="My Order" avatar="star_circle" text="watch all order"/>
				<Order />
			</View>
			<ScrollView style={{margin: '10 0 5 0'}}>
				<Cell title="Wallet" text="Remain $100.00" avatar="wallet_circle"/>
				<Cell title="Coupon" text="0" avatar="coupon_circle"/>
				<Cell title="Integration" avatar="shop_circle"/>
				<Cell title="Recommendation" avatar="recommend_circle"/>
				<Cell title="Cooperation" text="Hello World" avatar="cooperation_circle"/>
			</ScrollView>
		</View>
	}
}

const styles = StyleSheet.create({
	container:{

	},
});
export default Mine;