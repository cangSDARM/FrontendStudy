//更好的CSS管理插件, 自己下
import { createGlobalStyle } from 'styled-components'
//不是css文件, 是js文件
//使用: 和css相同
//只用在样式文件里导入


//全局生效的CSS
export const GlobalStyle = createGlobalStyle`
	/*Reset.CSS 基础样式适配所有浏览器, 自己下*/
	body{
		margin: 0 0;
	}
`
//使用: <GlobalStyle />

//非全局CSS
import Png from '../statics/log.png'
import styled from 'styled-components'

//使用图片带href的a标签
//效果可以嵌套
export const ComWrapper = styled.a.attrs({
  href: '/'
})`
	background: url(${Png});
	&.left{		/*如果ComWrapper的class还有left, 就左浮动*/
		float: left;
	}
	&.right{
		float: right;
	}
	&::placehoder{	/*input 的placehoder样式*/

	}
	.clildrenClass{		/*对所有子标签的相应class生效*/
		float: left;
	}

	${props => props.primary && css`		/*<ComWrapper primary>标签的CSS*/
	    background: palevioletred;
	    color: white;
	`}
`;

//使用: import { ComWrapper } from 'style.js'
//		<ComWrapper />
//		一个带样式的a标签