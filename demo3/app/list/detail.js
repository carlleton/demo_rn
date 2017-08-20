import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';

class ListDetail extends Component {
  constructor(props) {
    super(props);
    console.log(props.navigation);
    
    this.state = {};
  }
  static navigationOptions = ({navigation}) => ({
    // 展示数据 "`" 不是单引号 
    title: navigation.state.params.row.title,
    
  });
  render() {
    return (
      <View style={styles.container}>
        
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  header:{
    paddingTop:25,
    paddingBottom:12,
    backgroundColor:'#ee735c'
  },
  headerTitle:{
    color:'#fff',
    fontSize:16,
    textAlign:'center',
    fontWeight:'600'
  }
});

export default ListDetail