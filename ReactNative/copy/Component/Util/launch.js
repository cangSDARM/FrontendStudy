import React from 'react';
import {
	Image,
	StyleSheet
} from 'react-native';
import Main from '../Main';

class Launch extends React.Component{
	render(){
		return <Image source={{uri: 'launch'}} style={styles.content}/>
	}
	componentDidMount(){
		this.timer = setTimeout(()=>{
			this.props.navigator.replace({
				component: Main,
			})
		}, 3000);
	}
	componentWillUnmount(){
		clearTimeout(this.timer);
	}
}

const styles = StyleSheet.createStyle({
	content: {
		flex: 1,
	}
})