import React, { Component } from 'react';
import { 
  AppRegistry, 
  StyleSheet, 
  Text, 
  View,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
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
      paused:false,
      repeat:false,
      videoLoaded:false,
      playing:false,
      videoProgress:0.01,//播放进度
      videoTotal:0,//总时长
      currentTime:0,//当前时间
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
    var duration = data.playableDuration;
    var currentTime = data.currentTime;
    var percent = Number((currentTime/duration).toFixed(2));
    var newState={
      videoTotal:duration,
      currentTime:Number(currentTime.toFixed(2)),
      videoProgress:percent
    };
    if(!this.state.videoLoaded){
      newState.videoLoaded=true;
    }
    if(!this.state.playing){
      newState.playing=true;
    }
    this.setState(newState);
  }
  _onEnd(){
    this.setState({
      videoProgress:1,
      playing:false
    })
  }
  _onError(e){
    console.log(e);
    console.log('error');
  }
  _onBuffer(){
    console.log('buffer')
  }
  _rePlay(){
    this.refs.videoPlayer.seek(0);
  }
  _pause(){
    if(!this.state.paused){
      this.setState({
        paused:true
      })
    }
  }
  _resume(){
    if(this.state.paused){
      this.setState({
        paused:false
      })
    }
  }
  render() {
    var data=this.state.data;
    return (
      <View style={styles.container}>
        <View style={styles.videoBox}>
          <Video
            ref='videoPlayer'
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

          {
            !this.state.videoLoaded && <ActivityIndicator color='#ee735c' style={styles.loading} />
          }
          {
            this.state.videoLoaded && !this.state.playing
            ? <Icon 
                onPress={this._rePlay.bind(this)}
                name='ios-play'
                size={48}
                style={styles.playIcon} />
            : null
          }
          {
            this.state.videoLoaded && this.state.playing
            ? <TouchableOpacity onPress={this._pause.bind(this)} style={styles.pauseBtn}>
                {
                  this.state.paused
                  ? <Icon onPress={this._resume.bind(this)} name='ios-play' size={48} style={styles.resumeIcon} />
                  : <Text></Text>
                }
              </TouchableOpacity>
            : null
          }
          <View style={styles.progressBox}>
            <View style={[styles.progressBar,{width:width*this.state.videoProgress}]}>
            </View>
          </View>
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
    height:362,
    backgroundColor:'#000'
  },
  video:{
    width:width,
    height:360,
    backgroundColor:'#000'
  },
  loading:{
    position:'absolute',
    left:0,
    top:140,
    width:width,
    alignSelf:'center',
    backgroundColor:'transparent'
  },
  progressBox:{
    width:width,
    height:2,
    backgroundColor:'#ccc'
  },
  progressBar:{
    width:1,
    height:2,
    backgroundColor:'#ff6600'
  },
  playIcon:{
    position:'absolute',
    top:140,
    left:width/2-30,
    width:60,
    height:60,
    paddingTop:8,
    paddingLeft:22,
    backgroundColor:'transparent',
    borderColor:'#fff',
    borderWidth:1,
    borderRadius:30,
    color:'#ee7b66'
  },
  pauseBtn:{
    position:'absolute',
    left:0,
    top:0,
    width:width,
    height:360
  },
  resumeIcon:{
    position:'absolute',
    top:140,
    left:width/2-30,
    width:60,
    height:60,
    paddingTop:8,
    paddingLeft:22,
    backgroundColor:'transparent',
    borderColor:'#fff',
    borderWidth:1,
    borderRadius:30,
    color:'#ee7b66'
  }
});

export default ListDetail