import React, { Component } from 'react';
import { 
  AppRegistry, 
  StyleSheet, 
  Text, 
  View,
  Image,
  Alert,
  TouchableOpacity,
  Dimensions,
  AsyncStorage
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-picker';
import * as Progress from 'react-native-progress';
import sha1 from 'sha1';
//var ImagePicker = require('NativeModules').ImagePickerManager;

var request = require('../common/request');
var config = require('../common/config');
var width = Dimensions.get('window').width;
var photoOptions = {
  title: '选择头像',
  cancelButtonTitle:'取消',
  takePhotoButtonTitle:'拍照',
  chooseFromLibraryButtonTitle:'选择相册',
  quality:0.75,
  allowsEditing:true,
  noData:false,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};
var CLOUDINARY = {
  cloud_name: 'carlleton',  
  api_key: '637443679349469',  
  api_secret: 'JB-JvKhkesLuwEFdAjB7rCpakQ0', 
  base:'http://res.cloudinary.com/carlleton',
  image:'https://api.cloudinary.com/v1_1/carlleton/image/upload',
  video:'https://api.cloudinary.com/v1_1/carlleton/video/upload',
  audio:'https://api.cloudinary.com/v1_1/carlleton/raw/upload',
}
function avatarimg(id,type){
  if(id.indexOf('http')>-1){
    return id;
  }
  if(id.indexOf('data:image')){
    return id;
  }
  return CLOUDINARY.base+'/'+type+'/upload/'+id;
}
class My extends Component {
  constructor(props) {
    super(props);
    
    //var user = props.user||{}
    this.state = {
      user:{},
      avatarProgress:0,
      avatarUploading:false
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
  _pickPhoto(){
    console.log('aaaa');
    ImagePicker.showImagePicker(photoOptions, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        return;
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        //let source = { uri: response.uri };

        // You can also display the image using data:
        //let source = { uri: 'data:image/png;base64,' + response.data };
        var avatarData='data:image/jpeg;base64,' + response.data;
        var user=this.state.user;
        
        
        var timestamp=Date.now();
        var tags='app,avatar';
        var folder='avatar';
        var signatureURL=config.api.signature;
        var access_token=this.state.user.access_token;

        request.post(signatureURL,{
          access_token:access_token,
          timestamp:timestamp,
          folder:folder,
          tgs:tags,
          type:'avatar',
        })
        .then((json)=>{
          if(json.result=='0'){
            var signature = 'folder='+folder+'&tags='+tags+'&timestamp='+timestamp+CLOUDINARY.api_secret;
            signature=sha1(signature);

            var body = new FormData();
            body.append('folder',folder);
            body.append('signature',signature);
            body.append('tags',tags);
            body.append('timestamp',timestamp);
            body.append('api_key',CLOUDINARY.api_key);
            body.append('resource_type','image');
            body.append('file',avatarData);

            this._upload(body);
          }
        })
        .catch((err)=>{
          console.log(err);
        })
      }
    });
  }
  //上传到图床
  _upload(body){
    var xhr = new XMLHttpRequest();
    var url = CLOUDINARY.image;

    this.setState({
      avatarUploading:true,
      avatarProgress:0
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
      try{
        response=JSON.parse(response);

      }catch(e){
        console.log(e);
        console.log('parse fails');
      }
      if(response && response.public_id){
        var user=this.state.user;
        user.avatar=response.public_id;
        this.setState({
          user:user,
          avatarUploading:false,
          avatarProgress:0
        });
        this._asyncUser(true);
      }
    }
    if(xhr.upload){
      xhr.upload.onprogress=(event)=>{
        if(event.lengthComputable){
          var percent=Number((event.loaded / event.total).toFixed(2));
          this.setState({
            avatarProgress:percent
          })
        }
      }
    }
    xhr.send(body);
  }
  _asyncUser(isAvatar){//更新图片到服务器上
    var user=this.state.user;
    if(user && user.access_token){
      var url=config.api.update;
      request.post(url,user)
        .then((json)=>{
          if(json.result=='0'){
            var user=json.data;
            if(isAvatar){
              Alert.alert('头像更新成功')
            }
            this.setState({
              user:user
            },()=>{
              AsyncStorage.setItem('user',JSON.stringify(user));
            });
          }
        })
    }
  }
  render() {
    var user=this.state.user;
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>我的账户</Text>
        </View>
        {
          user.avatar
          ? <TouchableOpacity onPress={this._pickPhoto.bind(this)} style={styles.avatarContainer}>
              <Image source={{uri:avatarimg(user.avatar,'image')}} style={styles.avatarContainer}>
                <View style={styles.avatarBox}>
                  {
                    this.state.avatarUploading
                    ? <Progress.Circle 
                      showsText={true}
                      size={75}
                      color={'#ee735c'}
                      progress={this.state.avatarProgress}
                      />
                    : <Image
                      source={{uri:avatarimg(user.avatar,'image')}}
                      style={styles.avatar}
                      />
                  }
                  
                </View>
                <Text style={styles.avatarTip}>戳这里换头像</Text>
              </Image>
            </TouchableOpacity>
          : <TouchableOpacity onPress={this._pickPhoto.bind(this)} style={styles.avatarContainer}>
              <Text style={styles.avatarTip}>添加头像</Text>
              <View style={styles.avatarBox}>
                {
                  this.state.avatarUploading
                  ? <Progress.Circle 
                    showsText={true}
                    size={75}
                    color={'#ee735c'}
                    progress={this.state.avatarProgress}
                    />
                  : <Icon
                    name="ios-cloud-upload-outline"
                    style={styles.plusIcon}
                    />
                }
              </View>
            </TouchableOpacity>
        }
      </View>
    )
  }
}
const styles = StyleSheet.create({
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
  avatarContainer:{
    width:width,
    height:140,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#666'
  },
  avatarTip:{
    color:'#fff',
    backgroundColor:'transparent',
    fontSize:14
  },
  avatarBox:{
    marginTop:15,
    alignItems:'center',
    justifyContent:'center'
  },
  avatar:{
    marginBottom:15,
    width:width*0.2,
    height:width*0.2,
    resizeMode:'cover',
    borderRadius:width*0.1
  },
  plusIcon:{
    padding:20,
    paddingLeft:25,
    paddingRight:25,
    color:'#999',
    fontSize:24,
    backgroundColor:'#fff',
    borderRadius:8
  }
});

export default My