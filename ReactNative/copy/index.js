import React from 'react';
import {
	StyleSheet,
	View,
	Text,
	AppRegistry
} from 'react-native';

import Launch from './Component/Util/Launch';

class Index extends React.Component{

	render(){
		return <Launch />
	}
}

const styles = StyleSheet.create({
	container: {

	}
})

AppRegistry.registerComponent('based: RN 0.21', ()=> Index);