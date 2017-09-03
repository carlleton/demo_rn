/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { 
  AppRegistry,
  StyleSheet, 
  Text, 
  View,
  Dimensions,
  AsyncStorage
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  StackNavigator,
  TabNavigator,
} from 'react-navigation';


import List from './app/list/index';
import ListDetail from './app/list/detail';
import Edit from './app/edit/index';
import My from './app/my/index';
import Login from './app/my/login';

var width = Dimensions.get('window').width;
export default class demo3 extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      user:null,
      selectedTab:'list',
      logined:false,//是否已登录
    };
  }
  
  componentDidMount(){
    this._asyncAppStatus();
  }
  _logout(){
    AsyncStorage.removeItem('user');
    this.setState({
      logined:false,
      user:null
    })
  }
  _asyncAppStatus(){
    AsyncStorage.getItem('user')
      .then((data)=>{
        var user;
        var newState={};
        if(data){
          user=JSON.parse(data);
        }
        if(user && user.access_token){//用户已经登录过
          newState.user=user;
          newState.logined=true;
        }else{
          newState.logined=false;
        }
        this.setState(newState);
      })
  }
  _afterLogin(user){
    user=JSON.stringify(user);
    AsyncStorage.setItem('user',user)
      .then(()=>{
        this.setState({
          logined:true,
          user:user
        })
      })
  }
  render() {
    // if(!this.state.logined){
    //   return <Login afterLogin={this._afterLogin.bind(this)}></Login>;
    // }
    var ListNavigator = StackNavigator({
      List: {
        screen: List,
        navigationOptions: ({navigation}) => ({
            title: '列表页面'
        }),
      },
      ListDetail: {
        screen: ListDetail,
        navigationOptions:({navigation})=>({
          tabBarVisible:false,//是否隐藏标签栏。默认不隐藏(true) 
          header:null
        })
      },
    },{
      navigationOptions: {
          headerTitleStyle: styles.headerTitle,
          headerStyle: styles.header,
          gesturesEnabled:true,//是否支持滑动返回手势，iOS默认支持，安卓默认关闭 
      },
      
    })
    const Tab=TabNavigator({
      List:{
        screen:ListNavigator,
        navigationOptions:{
          tabBarIcon:({focused,tintColor})=>(
            <Icon name={focused?'ios-home':'ios-home-outline'} size={30} color={tintColor}/>
          )
        }
      },
      Edit:{
        screen:Edit,
        navigationOptions:{
          tabBarIcon:({focused,tintColor})=>(
            <Icon name={focused?'ios-videocam':'ios-videocam-outline'} size={30} color={tintColor}/>
          )
        }
      },
      My:{
        screen:My,
        navigationOptions:{
          logout:this._logout,
          tabBarIcon:({focused,tintColor})=>(
            <Icon name={focused?'ios-more':'ios-more-outline'} size={30} color={tintColor}/>
          )
        }
      }
    },{
      animationEnabled: true, // 切换页面时是否有动画效果
      tabBarPosition: 'bottom', // 显示在底端，android 默认是显示在页面顶端的
      swipeEnabled: false, // 是否可以左右滑动切换tab
      backBehavior: 'none', // 按 back 键是否跳转到第一个Tab(首页)， none 为不跳转
      visible:false,
      tabBarOptions: {
        showLabel:false,//默认显示标签
        activeTintColor: '#4E78E7', // 文字和图片选中颜色
        inactiveTintColor: 'gray', // 文字和图片未选中颜色
        showIcon: true, // android 默认不显示 icon, 需要设置为 true 才会显示
        indicatorStyle: {
            height: 0  // 如TabBar下面显示有一条线，可以设高度为0后隐藏
        }, 
        style: {
            backgroundColor: '#fff', // TabBar 背景色
            // height: 44
        },
        labelStyle: {
            fontSize: 10, // 文字大小
        }
      },
    });

    return (
      <Tab
        screenProps={{
          logout:this._logout.bind(this)
        }}
       />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  header:{
    paddingTop:25,
    paddingBottom:12,
    backgroundColor:'#ee735c',
  },
  headerTitle:{
    color:'#fff',
    fontSize:16,
    fontWeight:'600',
    alignSelf : 'center'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('demo3', () => demo3);
