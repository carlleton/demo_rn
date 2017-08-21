import React, { Component } from 'react';
import { 
  AppRegistry, 
  StyleSheet, 
  Text, 
  View,
  Dimensions
} from 'react-native';
import Video from 'react-native-video';    
//var Video = require('react-native-video').default;
var width = Dimensions.get('window').width;

class ListDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data:props.navigation.state.params.data,
      rate:1,
      muted:false,
      resizeMode:'contain',
      repeat:false,
      videoPlayer:null
    };
  }
  static navigationOptions = ({navigation}) => ({
    // 展示数据 "`" 不是单引号 
    title: navigation.state.params.data.title,
    
  });
  _onLoadStart(){
    console.log('load start');
  }
  _onLoad(){
    console.log('load');
  }
  _onProgress(data){
    console.log(data);
    console.log('press,');
  }
  _onEnd(){
    console.log('end');
  }
  _onError(e){
    console.log(e);
    console.log('error');
  }
  _onBuffer(){
    console.log('buffer')
  }
  render() {
    var data=this.state.data;
    console.log(data.video);
    return (
      <View style={styles.container}>
        <View style={styles.videoBox}>
          <Video
            ref={(ref) => {
             this.videoPlayer = ref
           }} 
            source={{uri:data.video}}
            style={styles.video}
            volume={2}
            paused={false}
            rate={this.state.rate}
            muted={this.state.muted}
            resizeMode={this.state.resizeMode}
            repeat={this.state.repeat}

            onLoadStart={this._onLoadStart.bind(this)}
            onLoad={this._onLoad.bind(this)}
            onProgress={this._onProgress.bind(this)}
            onEnd={this._onEnd.bind(this)}
            onError={this._onError.bind(this)}
            onBuffer={this._onBuffer.bind(this)}
          />
        </View>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  videoBox:{
    width:width,
    height:360,
    backgroundColor:'#000'
  },
  video:{
    width:width,
    height:360,
    backgroundColor:'#000'
  }
});

export default ListDetail