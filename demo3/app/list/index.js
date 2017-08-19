import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View,FlatList,Image,Dimensions,TouchableHighlight } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

var width = Dimensions.get('window').width;

class List extends Component {
    constructor(props) {
      super(props);
        
      this.state = {
        showsourceData:true,
        sourceData:[{
            "key":'111',
            "_id":'111',
            "thumb":'https://dummyimage.com/1200x600/174a0',
            "video":'http://localhost/1.mp4'
        },{
            "key":'222',
            "_id":'222',
            "thumb":'https://dummyimage.com/1200x600/174a0',
            "video":'http://localhost/1.mp4'
        }]
      };
    }
    _renderRow=({item})=>(
        <TouchableHighlight>
            <View style={styles.item}>
                <Text style={styles.title}>{item._id}</Text>
                <Image 
                  source={{uri:item.thumb}}
                  style={styles.thumb}
                >
                     <Icon
                      name="ios-play"
                      size={28}
                      style={styles.play} />
                </Image>
                <View style={styles.itemFooter}>
                    <View style={styles.handleBox}>
                        <Icon
                          name="ios-heart-outline"
                          size={28}
                          style={styles.up} />
                        <Text style={styles.handleText}>喜欢</Text>
                    </View>
                    <View style={styles.handleBox}>
                        <Icon
                          name="ios-chatboxes-outline"
                          size={28}
                          style={styles.commentIcon} />
                        <Text style={styles.handleText}>评论</Text>
                    </View>
                </View>
            </View>
        </TouchableHighlight>
    )
    render() {
        return (
          <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>列表页面</Text>
            </View>
            <FlatList
                data={this.state.sourceData}
                renderItem={this._renderRow}
             />
          </View>
        )
    }
}
var styles = StyleSheet.create({
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
  },
  item:{
    width:width,
    marginBottom:10,
    backgroundColor:'#fff'
  },
  thumb:{
    width:width,
    height:width * 0.5,
    resizeMode:'cover'
  },
  title:{
    padding:10,
    fontSize:18,
    color:'#333'
  },
  itemFooter:{
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor:'#eee'
  },
  handleBox:{
    padding:10,
    flexDirection:'row',
    width:width/2-0.5,
    justifyContent:'center',
    backgroundColor:'#fff'
  },
  play:{
    position:'absolute',
    bottom:14,
    right:14,
    width:46,
    height:46,
    paddingTop:9,
    paddingLeft:18,
    backgroundColor:'transparent',
    borderColor:'#fff',
    borderWidth:1,
    borderRadius:23,
    color:'#ee7b66'
  },
  handleText:{
    paddingLeft:12,
    fontSize:18,
    color:'#333'
  },
  up:{
    fontSize:22,
    color:'#333'
  },
  commentIcon:{
    fontSize:22,
    color:'#333'
  }
});
export default List