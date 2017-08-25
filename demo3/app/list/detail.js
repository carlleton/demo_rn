import React, { Component } from 'react';
import { 
  AppRegistry, 
  StyleSheet, 
  Text, 
  View,
  Image,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import Button from 'react-native-button';
//var Video = require('react-native-video').default;

var request = require('../common/request')
var config = require('../common/config')
var width = Dimensions.get('window').width;

var cacheResults={
    nextPage:1,
    items:[],
    total:0
}
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
      videoOK:true,
      isLoading:false,
      isRefreshing:false,

      //modal
      content:'',
      animationType:'none',
      modalVisible:false,
      isSending:false
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
    cacheResults.nextPage=1;
    this._fetchData(cacheResults.nextPage);
  }
  _fetchData(page){
    this.setState({
        isLoading:true
    })
    request.get(config.api.comment,{
        page:page,
        videoid:this.state.data._id
    }).then((json) => {
      if(json.result=='0'){
          var items = cacheResults.items.slice();
          cacheResults.items=items.concat(json.data)
          cacheResults.nextPage+=1;
          this.setState({
              comments:cacheResults.items.slice(),
              isLoading:false
          })
          cacheResults.total=json.total;
      }else{
          console.log(JSON.stringify(json));
      }
    })
    .catch((error) => {
      this.setState({
          isLoading:false
      })
    });
  }
  _hasMore(){
      if(cacheResults.total==0)return true;
      return cacheResults.items.length < cacheResults.total
  }
  _fetchMoreData(){
      if(!this._hasMore() || this.state.isLoading)return;
      this._fetchData(cacheResults.nextPage);
  }
  _keyExtractor = (item, index) => item._id
  _renderRow=({item})=>{
    return (
      <View key={item._id} style={styles.replayBox}>
        <Image style={styles.replyAvatar} source={{uri:item.replyBy.avatar}} />
        <View style={styles.reply}>
          <Text style={styles.replyNickname}>{item.replyBy.nickname}</Text>
          <Text style={styles.replyContent}>{item.content}</Text>
        </View>
      </View>
    )
  }
  _focus(){
    this._setModalVisible(true);
  }
  _blur(){

  }
  _closeModal(){
    this._setModalVisible(false);
  }
  _setModalVisible(isVisible){
    this.setState({
      modalVisible:isVisible
    })
  }
  //评论
  _submit(){
    if(!this.state.content){
      return Alert.alert('留言不能为空');
    }
    if(this.state.isSending){
      return Alert.alert('正在评论中！');
    }
    this.setState({
      isSending:true
    },()=>{
        var body={
          vieoid:this.data._id,
          content:this.state.content
        };
        var url=config.comment;
        request.post(url,body)
          .then((json)=>{
            if(json && json.result=='0'){
              var content=this.state.content;
              var items=cacheResults.items.slice();
              items=[{
                content:content,
                replyBy:{
                  nickname:'小v说',
                  avatar:'http://dummyimage.com/640x640/ccbcba',
                }
              }].concat(items);
              cacheResults.items = items;
              cacheResults.total++;
              this.setState({
                isSending:false,
                comments:cacheResults.items,
                content:''
              })
              this._setModalVisible(false);
            }
          })
          .cache((err)=>{
            thie.setState({
              isSending:false,
            });
            this._setModalVisible(false);
            Alert.alert('留言失败，稍后重试！');
          })
      }
    )
  }
  _renderHeader(){
    var data=this.state.data;
    return (
      <View style={styles.listHeader}>
        <View style={styles.infoBox}>
          <Image style={styles.avatar} source={{uri:data.author.avatar}} />
          <View style={styles.descBox}>
            <Text style={styles.nickname}>{data.author.nickname}</Text>
            <Text style={styles.title}>{data.title}</Text>
          </View>
        </View>
        <View style={styles.commentBox}>
          <View style={styles.comment}>
            <TextInput
              placeholder="敢不敢评论一个..."
              style={styles.content}
              multiline={true}
              onFocus={this._focus.bind(this)}
              />
          </View>
        </View>
        <View style={styles.commentArea}>
          <Text style={styles.commentTitle}>精彩评论</Text>
        </View>
      </View>
      
    );
  }
  _renderFooter(){
        if(!this._hasMore()){
            return (
                <View style={styles.loadingMore}>
                    <Text style={styles.loadingText}>没有更多了</Text>
                </View>
            )
        }
        if(this.isLoading){
            return (<View style={styles.loadingMore} />)
        }
        return <ActivityIndicator animating={true} style={styles.loadingMore} />
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
          <FlatList
              data={this.state.comments}
              renderItem={this._renderRow.bind(this)}
              onEndReached={this._fetchMoreData.bind(this)}
              onEndReachedThreshold={20}
              refreshing={this.state.isRefreshing}
              keyExtractor={this._keyExtractor.bind(this)}
              ListFooterComponent={this._renderFooter.bind(this)}
              ListHeaderComponent={this._renderHeader.bind(this)}
           />
           <Modal
            animationType={'fade'}
            visible={this.state.modalVisible}
            onRequestClose={()=>{this._setModalVisible.bind(this,false)}}>
              <View style={styles.modalContainer}>
                <Icon
                  onPress={this._closeModal.bind(this)}
                  name='ios-close-outline'
                  style={styles.closeIcon} />
                <View style={styles.commentBox}>
                  <View style={styles.comment}>
                    <TextInput
                      placeholder="敢不敢评论一个..."
                      style={styles.content}
                      multiline={true}
                      defaultValue={this.state.content}
                      onChangeText={(text)=>{
                        this.setState({
                          content:text
                        });
                      }}
                      />
                  </View>
                </View>
                <Button style={styles.submitBtn} onPress={this._submit.bind(this)}>
                  评论
                </Button>
              </View>
            </Modal>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  modalContainer:{
    flex:1,
    paddingTop:45,
    backgroundColor:'#fff'
  },
  closeIcon:{
    alignSelf:'center',
    fontSize:30,
    color:'#ee753c'
  },
  submitBtn:{
    width:width-20,
    padding:16,
    marginTop:20,
    marginBottom:20,
    borderWidth:1,
    borderColor:'#ee753c',
    borderRadius:4,
    color:'#ee753c',
    fontSize:18
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
  },
  loadingMore:{
    marginVertical:20,
  },
  loadingText:{
    color:'#777',
    textAlign:'center'
  },
  listHeader:{
    marginTop:10,
    width:width
  },
  commentBox:{
    marginTop:10,
    marginBottom:10,
    padding:8,
    width:width
  },
  content:{
    paddingLeft:20,
    color:'#333',
    borderWidth:11,
    borderColor:'#ddd',
    borderRadius:4,
    fontSize:14,
    height:80
  },
  commentArea:{
    width:width,
    paddingBottom:6,
    paddingLeft:10,
    paddingRight:10,
    borderBottomWidth:1,
    borderBottomColor:'#eee'
  }
});

export default ListDetail