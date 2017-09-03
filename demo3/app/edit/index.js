import React, { Component } from 'react';
import { 
  AppRegistry, 
  StyleSheet, 
  Text, 
  View,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  AsyncStorage
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import ImagePicker from 'react-native-image-picker';
import * as Progress from 'react-native-progress';

var request = require('../common/request');
var config = require('../common/config');
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
      user:{},
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

      videoUploadedProgress:0.01,
      videoUploading:false,
      videoUploaded:false,

      //video player
      rate:1,
      muted:true,
      resizeMode:'contain',
      paused:false,
      repeat:false,
    };
  }
  componentDidMount(){
    AsyncStorage.getItem('user')
      .then((data)=>{
        var user=null;
        if(data){
          user=JSON.parse(data);
        }
        if(user && user.access_token){
          this.setState({
            user:user
          })
        }
      })
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
  _getQiniuToken(response){
    var signatureURL=config.api.signature;
    var access_token = this.state.user.access_token
    var uri = response.uri
    return request.post(signatureURL,{
        access_token:access_token,
        type:'video',
        cloud:'qiniu'
      })
      .then((json)=>{
        console.log(json)
        var data = json.data
        var token = data.token
        var key = data.key
        var body = new FormData()
        body.append('token',token)
        body.append('key',key)
        body.append('file',{
          type:'video/mp4',
          uri:uri
        })
        this._upload(body);
      })
      .catch((err)=>{
        console.log(err);
      })
  }
  _getCloudianryToken(response){
    var signatureURL=config.api.signature;
    var avatarData='data:image/jpeg;base64,' + response.data;
    var access_token = this.state.user.access_token
    var timestamp=Date.now();
    var tags='app,avatar';
    var folder='avatar';
    return request.post(signatureURL,{
      access_token:access_token,
      timestamp:timestamp,
      type:'avatar',
      cloud:'cloudinary'
    })
    .then((json)=>{
      if(json.result=='0'){
        var signature = json.data;
        var body = new FormData();
        body.append('folder',folder);
        body.append('signature',signature);
        body.append('tags',tags);
        body.append('timestamp',timestamp);
        body.append('api_key',config.cloudinary.api_key);
        body.append('resource_type','image');
        body.append('file',avatarData);

        this._upload(body);
      }
    })
    .catch((err)=>{
      console.log(err);
    })
  }
  //上传到图床
  _upload(body){
    var xhr = new XMLHttpRequest();
    var url = ''
    if(config.cloud=='qiniu'){
      url = config.qiniu.upload
    }else if(config.cloud=='cloudinary'){
      url = config.cloudinary.video
    }

    this.setState({
      videoUploadedProgress:0,
      videoUploading:true,
      videoUploaded:false
    })
    console.log(url);
    xhr.open('POST',url);
    xhr.onload=()=>{
      if(xhr.status!==200){
        Alert.alert('请求失败');
        console.log(xhr.responseText);
        return;
      }
      if(!xhr.responseText){
        Alert.alert('请求失败');
        return;
      }
      var response = xhr.responseText;
      console.log(response)
      try{
        response=JSON.parse(response);

      }catch(e){
        console.log(e);
        console.log('parse fails');
      }
      if(response){
        console.log(response)
        console.log(this.state.videoUploadedProgress)
        this.setState({
          video:response,
          videoUploading:false,
          videoUploaded:true
        });
      }
    }
    if(xhr.upload){
      xhr.upload.onprogress=(event)=>{
        if(event.lengthComputable){
          var percent=Number((event.loaded / event.total).toFixed(2));
          this.setState({
            videoUploadedProgress:percent
          })
        }
      }
    }
    xhr.send(body);
  }
  _pickVideo(){
    console.log('aaaa');
    ImagePicker.showImagePicker(videoOptions, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        return;
      }
      if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        var uri = response.uri
        this.setState({
          previewVideo:uri
        })
        if(config.cloud=='qiniu'){
          this._getQiniuToken(response)
        }else if(config.cloud=='cloudinary'){
          this._getCloudianryToken(response)
        }
      }
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
                {
                  !this.state.videoUploaded && this.state.videoUploading
                  ? <View style={styles.progressTipBox}>
                      <Progress.Bar 
                        width={width}
                        color={'#ee735c'}
                        progress={this.state.videoUploadedProgress}
                      />
                      <Text style={styles.progressTip}>正式生成静音视频，已完成{(this.state.videoUploadedProgress * 100).toFixed(2)}%</Text>
                    </View>
                  : null
                }
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
  progressTipBox:{
    position:'absolute',
    left:0,
    bottom:0,
    width:width,
    height:30,
    backgroundColor:'rgba(244,244,244,0.65)'
  },
  progressTip:{
    color:'#333',
    width:width-10,
    padding:5
  }
});

export default Edit