import React from 'react';
import {
	StyleSheet,
	View,
	Text,
	Image,
	Navigator
} from 'react-native';

import TabNavigator from 'react-native-tab-navigator';

import Home from '../Home';
import Shop from '../Shop';
import Mine from '../Mine';
import More from '../More';

class Main extends React.Component{
	tabbar = [
		{
			icon:'tabbar_home',
			selected:'tabbar_home_selected',
			title: 'Home',
			component: <Home />
		},
		{
			icon:'tabbar_shop',
			selected:'tabbar_shop_selected',
			title: 'Shop',
			component: <Shop />
		},
		{
			icon:'tabbar_mine',
			selected:'tabbar_mine_selected',
			title: 'Mine',
			component: <Mine />
		},
		{
			icon:'tabbar_more',
			selected:'tabbar_more_selected',
			title: 'More',
			component: <More />
		}
	]
	constructor(props){
		super(props);
		this.state = {
			selectedTab: 'Home',
		}
	}
	render(){
		return <TabNavigator>
			{this.tabbar.map((item, index)=>{
				return <TabNavigator.Item
					title={item.title}
					renderIcon={()=>
						<Image source={{uri:item.icon}} style={styles.icon}/>
					}
					renderSelectedIcon={()=>
						<Image source={{uri:item.selected}} styles={styles.icon}/>
					}
					onPress={()=>this.setState({selectedTab:item.title})}
					selected={this.state.selectedTab===item.title}
					key={item.title}
				>
					<Navigator
						initialRoute={{name:item.title, component: item.component}}
						configureScene={()=>
							Navigator.SceneConfigs.PushFromRight
						}
						renderScene={(route, navigator)=>{
							let Comp = route.component;
							return <Comp {...route.passProps} navigator={navigator}/>;
						}}
					/>
				</TabNavigator.Item>
			})}
		</TabNavigator>
	}
}

const styles = StyleSheet.create({
	icon:{
		width: 30,
		height: 30
	}
})

export default Main;