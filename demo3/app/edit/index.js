import React, { Component } from 'react';
import { 
  AppRegistry, 
  StyleSheet, 
  Text, 
  View,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import ImagePicker from 'react-native-image-picker';

var width = Dimensions.get('window').width;
var height = Dimensions.get('window').height;
var videoOptions = {
  title: '选择视频',
  cancelButtonTitle:'取消',
  takePhotoButtonTitle:'录制10秒视频',
  chooseFromLibraryButtonTitle:'选择已有视频',
  videoQualigy:'medium',
  mediaType:'video',
  durationLimit:10,
  noData:false,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
}
class Edit extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      previewVideo:null,

      //video loads
      videoLoaded:false,
      playing:false,
      videoProgress:0.01,//播放进度
      videoTotal:0,//总时长
      currentTime:0,//当前时间
      videoOK:true,
      isLoading:false,
      isRefreshing:false,

      //video player
      rate:1,
      muted:true,
      resizeMode:'contain',
      paused:false,
      repeat:false,
    };
  }
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
    console.log('on end');
    this.setState({
      paused:true,
      playing:false
    })
  }
  _onError(e){
    this.setState({
      videoOK:false
    })
    console.log(e);
    console.log('error');
  }
  _onBuffer(){
    console.log('buffer')
  }
  _rePlay(){
    this.videoPlayer.seek(0);
    if(this.state.paused){
      this.setState({
        paused:false
      })
    }
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
  _pickVideo(){
    console.log('aaaa');
    ImagePicker.showImagePicker(videoOptions, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        return;
      }
      var uri = response.uri
      this.setState({
        previewVideo:uri
      })

      // else if (response.error) {
      //   console.log('ImagePicker Error: ', response.error);
      // }
      // else if (response.customButton) {
      //   console.log('User tapped custom button: ', response.customButton);
      // }
      // else {
      //   if(config.cloud=='qiniu'){
      //     this._getQiniuToken(response)
      //   }else if(config.cloud=='cloudinary'){
      //     this._getCloudianryToken(response)
      //   }
      // }
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>
            {this.state.previewVideo ? '点击按钮配音':'将开阔人生，从配音开始'}
          </Text>
          <Text style={styles.toolbarEdit} onPress={this._pickVideo.bind(this)}>更换视频</Text>
        </View>
        <View style={styles.page}>
        {
          this.state.previewVideo
          ? <View style={styles.videoContainer}>
              <View style={styles.videoBox}>
                <Video
                  ref={(ref: Video) => { this.videoPlayer = ref }}
                  source={{uri:this.state.previewVideo, type: 'mpd'}}
                  style={styles.video}
                  volume={2}
                  paused={this.state.paused}
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
          : <TouchableOpacity style={styles.uploadContainer} onPress={this._pickVideo.bind(this)}>
              <View style={styles.uploadBox}>
                <Image source={require('../assets/images/record.png')} style={styles.uploadIcon} />
                <Text style={styles.uploadTitle}>点我上传视频</Text>
                <Text style={styles.uploadDesc}>建议时长不超过10秒</Text>
              </View>
             </TouchableOpacity>
        }
        </View>
      </View>
    )
  }
}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  toolbar:{
    flexDirection:'row',
    paddingTop:25,
    paddingBottom:12,
    backgroundColor:'#ee735c'
  },
  toolbarTitle:{
    flex:1,
    fontSize:16,
    color:'#fff',
    textAlign:'center',
    fontWeight:'600'
  },
  toolbarEdit:{
    position:'absolute',
    right:10,
    top:26,
    color:'#fff',
    textAlign:'right',
    fontWeight:'600',
    fontSize:14
  },
  page:{
    flex:1,
    alignItems:'center'
  },
  uploadContainer:{
    marginTop:90,
    width: width - 40,
    height:200,
    paddingBottom:10,
    borderWidth:1,
    borderColor:'#ee735c',
    justifyContent:'center',
    borderRadius:6,
    backgroundColor:'#fff'
  },
  uploadTitle:{
    marginBottom:10,
    textAlign:'center',
    fontSize:16,
    color:'#000'
  },
  uploadDesc:{
    color:'#999',
    textAlign:'center',
    fontSize:12,
  },
  uploadIcon:{
    width:110,
    height:110,
    resizeMode:'contain'
  },
  uploadBox:{
    flex:1,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center'
  },
  videoContainer:{
    width:width,
    justifyContent:'center',
    alignItems:'flex-start'
  },
  videoBox:{
    width:width,
    height:height*0.6
  },
  video:{
    width:width,
    height:height * 0.6
  },

});

export default Edit