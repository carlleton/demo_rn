import React, { Component } from 'react';
import { 
  AppRegistry, 
  StyleSheet, 
  Text, 
  View,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';    
//var Video = require('react-native-video').default;

var request = require('../common/request')
var config = require('../common/config')
var width = Dimensions.get('window').width;

class ListDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data:props.navigation.state.params.data,
      comments:[],//评论列表
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
      videoOK:true
    };
  }
  static navigationOptions = ({navigation}) => ({
    // 展示数据 "`" 不是单引号 
    title: navigation.state.params.data.title,
    
  });
  _pop(){
    this.props.navigation.goBack();
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
    this.setState({
      videoProgress:1,
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
    this.refs.videoPlayer.seek(0);
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
  componentDidMount(){
    this._fetchData();
  }
  _fetchData(){
    var url=config.api.comment;
    request.get(url,{
      videoid:this.state.data._id
    })
    .then((json)=>{
      if(json.result=='0'){
        var comments = json.data;
        if(comments && comments.length>0){
          this.setState({
            comments:comments
          })
        }
      }
    })
    .catch((error)=>{
      console.log(error);
    })
  }
  _keyExtractor = (item, index) => item._id
  _renderRow(row){
    return (
      <View key={row._id} style={styles.replayBox}>
        <Image style={styles.replyAvatar} source={{uri:row.replyBy.avatar}} />
        <View style={styles.reply}>
          <Text style={styles.replyNickname}>{row.replyBy.nickname}</Text>
          <Text style={styles.replyContent}>{row.content}</Text>
        </View>
      </View>
    )
  }
  render() {
    var data=this.state.data;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBox} onPress={this._pop.bind(this)}>
            <Icon name='ios-arrow-back' style={styles.backIcon} />
            <Text style={styles.backText}>返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLine={1}>视频详情页</Text>
        </View>
        <View style={styles.videoBox}>
          <Video
            ref='videoPlayer'
            source={{uri:data.video}}
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
            !this.state.videoOK && <Text style={styles.failText}>视频出错了！很抱歉</Text>
          }

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
        <ScrollView
          automaticallyAdjustContentInsets={false}
          enableEmptySections={true}
          showVerticalScrollIndicator={false}
          style={styles.scrollView}>
          <View style={styles.infoBox}>
            <Image style={styles.avatar} source={{uri:data.author.avatar}} />
            <View style={styles.descBox}>
              <Text style={styles.nickname}>{data.author.nickname}</Text>
              <Text style={styles.title}>{data.title}</Text>
            </View>
          </View>
          <FlatList
                data={this.state.sourceData}
                renderItem={this._renderRow.bind(this)}
                refreshing={this.state.isRefreshing}
             />
        </ScrollView>
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
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    width:width,
    height:64,
    paddingTop:20,
    paddingLeft:10,
    paddingRight:10,
    borderBottomWidth:1,
    borderColor:'rgba(0,0,0,0.1)',
    backgroundColor:'#fff'
  },
  backBox:{
    position:'absolute',
    left:12,
    top:32,
    width:50,
    flexDirection:'row',
    alignItems:'center'
  },
  headerTitle:{
    width:width-120,
    textAlign:'center'
  },
  backIcon:{
    color:'#999',
    fontSize:20,
    marginRight:5,
  },
  backText:{
    color:'#999'
  },
  videoBox:{
    width:width,
    height:width*0.56,
    backgroundColor:'#000'
  },
  video:{
    width:width,
    height:width*0.56,
    backgroundColor:'#000'
  },
  loading:{
    position:'absolute',
    left:0,
    top:80,
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
    top:90,
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
    height:width*0.56
  },
  resumeIcon:{
    position:'absolute',
    top:90,
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
  failText:{
    position:'absolute',
    left:0,
    top:90,
    width:width,
    textAlign:'center',
    backgroundColor:'transparent',
    color:'#fff'
  
  },
  infoBox:{
    width:width,
    flexDirection:'row',
    justifyContent:'center',
    marginTop:10
  },
  avatar:{
    width:60,
    height:60,
    marginRight:10,
    marginLeft:10,
    borderRadius:30,
  },
  descBox:{
    flex:1,
  },
  nickname:{
    fontSize:18,
  },
  title:{
    marginTop:8,
    fontSize:16,
    color:'#666'
  },
  replayBox:{
    flexDirection:'row',
    justifyContent:'flex-start',
    marginTop:10,
  },
  replyAvatar:{
    width:40,
    height:40,
    marginRight:10,
    marginLeft:10,
    borderRadius:20
  },
  replyNickname:{
    color:'#666',
  },
  replyContent:{
    color:'#666',
    marginTop:4
  },
  reply:{
    flex:1
  }
});

export default ListDetail