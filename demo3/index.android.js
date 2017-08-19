/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import TabNavigator from 'react-native-tab-navigator';

import List from './app/list/index';
import Edit from './app/edit/index';
import My from './app/my/index';

export default class demo3 extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      selectedTab:'list'
    };
  }
  render() {
    return (
      <TabNavigator
       tabBarStyle={{backgroundColor: 'white'}}
        style={{backgroundColor: 'white'}}
      >
          <TabNavigator.Item
              selected={this.state.selectedTab === 'list'}
              renderIcon={() => <Icon name='ios-home-outline' size={30} color={'gray'}/>}
              renderSelectedIcon={() => <Icon name='ios-home' size={30} color={'#4E78E7'}/>}
              onPress={() => this.setState({selectedTab: 'list'})}
              >
           <List />
          </TabNavigator.Item>
         <TabNavigator.Item
            selected={this.state.selectedTab === 'edit'}
            renderIcon={() => <Icon name='ios-videocam-outline' size={30} color={'gray'}/>}
            renderSelectedIcon={() => <Icon name='ios-videocam' size={30} color={'#4E78E7'}/>}
            onPress={() => this.setState({selectedTab: 'edit'})}
          >
             <Edit />
         </TabNavigator.Item>
         <TabNavigator.Item
            selected={this.state.selectedTab === 'my'}
            renderIcon={() => <Icon name='ios-more-outline' size={30} color={'gray'}/>}
            renderSelectedIcon={() => <Icon name='ios-more' size={30} color={'#4E78E7'}/>}
            onPress={() => this.setState({
              selectedTab: 'my'
            })}
            >
             <My />
         </TabNavigator.Item>
     </TabNavigator>
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
