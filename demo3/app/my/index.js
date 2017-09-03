import React, { Component } from 'react';
import { 
  AppRegistry, 
  StyleSheet, 
  Text, 
  View,
  Image,
  Alert,
  TextInput,
  TouchableOpacity,
  Dimensions,
  AsyncStorage,
  Modal
} from 'react-native';
import Button from 'react-native-button';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-picker';
import * as Progress from 'react-native-progress';
import sha1 from 'sha1'
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

function avatarimg(id,type){
  if(!id)return ''
  if(id.indexOf('http')>-1){
    return id;
  }
  if(id.indexOf('data:image')>-1){
    return id;
  }
  if(config.cloud==='qiniu'){
    return config.qiniu.base+'/'+id
  }
  return config.cloudinary.base+'/'+type+'/upload/'+id
}
class My extends Component {
  constructor(props) {
    super(props);
    var user = props.user||{}
    this.state = {
      user:{},
      avatarProgress:0,
      avatarUploading:false,
      modalVisible:false
    };
  }
  _edit(){
    this.setState({
      modalVisible:true
    })
  }
  _closeModal(){
    this.setState({
      modalVisible:false
    })
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

  _getQiniuToken(response){
    var signatureURL=config.api.signature;
    var access_token = this.state.user.access_token
    var uri = response.uri
    return request.post(signatureURL,{
        access_token:access_token,
        cloud:'qiniu',
        type:'avatar'
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
          type:'image/png',
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
        if(config.cloud=='qiniu'){
          this._getQiniuToken(response)
        }else if(config.cloud=='cloudinary'){
          this._getCloudianryToken(response)
        }
      }
    });
  }
  //上传到图床
  _upload(body){
    var xhr = new XMLHttpRequest();
    var url = ''
    if(config.cloud=='qiniu'){
      url = config.qiniu.upload
    }else if(config.cloud=='cloudinary'){
      url = config.cloudinary.image
    }

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
      if(response){
        var user=this.state.user;
        if(response.public_id){
          user.avatar=response.public_id
        }else if(response.key){
          user.avatar = response.key
        }
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
              this._closeModal();
              AsyncStorage.setItem('user',JSON.stringify(user));
            });
          }
        })
    }
  }
  _changeUserState(key,val){
    var user=this.state.user;
    user[key]=val;
    this.setState({
      user:user
    })
  }
  _submit(){
    this._asyncUser();
  }
  _logout(){
    this.props.screenProps.logout();
  }
  _setModalVisible(isVisible){
    this.setState({
      modalVisible:isVisible
    })
  }
  render() {
    var user=this.state.user;
    console.log(avatarimg(user.avatar,'image'))
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>我的账户</Text>
          <Text style={styles.toolbarEdit} onPress={this._edit.bind(this)}>编辑</Text>
        </View>
        {
          user.avatar
          ? <TouchableOpacity onPress={this._pickPhoto.bind(this)} style={styles.avatarContainer}>
              <Image
                source={{uri:avatarimg(user.avatar,'image')}}
                style={styles.avatarContainer}>
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
        <Modal
          animationType={'fade'}
          visible={this.state.modalVisible}
          onRequestClose={()=>{this._setModalVisible(false)}}>
          <View style={styles.modalContainer}>
            <Icon
              name='ios-close-outline'
              onPress={this._closeModal.bind(this)}
              style={styles.closeIcon}
             />
             <View style={styles.fieldItem}>
              <Text style={styles.label}>昵称</Text>
              <TextInput
               placeholder={"输入你的昵称"}
               style={styles.inputField}
               autoCapitalize={'none'}
               autoCorrect={false}
               defaultValue={user.nickname}
               onChangeText={(text)=>{
                this._changeUserState('nickname',text)
               }}
                />
             </View>
             <View style={styles.fieldItem}>
              <Text style={styles.label}>年龄</Text>
              <TextInput
               placeholder={"输入你的年龄"}
               style={styles.inputField}
               autoCapitalize={'none'}
               autoCorrect={false}
               defaultValue={user.age+''}
               onChangeText={(text)=>{
                this._changeUserState('age',text)
               }}
                />
             </View>
             <View style={styles.fieldItem}>
              <Text style={styles.label}>性别</Text>
              <Icon.Button
                onPress={()=>{
                  this._changeUserState('gender','male')
                }}
                style={[
                  styles.gender,
                  user.gender==='male' && styles.genderChecked
                  ]}
                name='ios-paw-outline'>男</Icon.Button>
              <Icon.Button
                onPress={()=>{
                  this._changeUserState('gender','female')
                }}
                style={[
                  styles.gender,
                  user.gender==='female' && styles.genderChecked
                  ]}
                name='ios-paw'>女</Icon.Button>
             </View>
             <Button
               style={styles.btn}
               onPress={this._submit.bind(this)}
               >保存资料</Button>
          </View>
        </Modal>
        <Button
         style={styles.btn}
         onPress={this._logout.bind(this)}
         >退出登录</Button>
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
  toolbarEdit:{
    position:'absolute',
    right:10,
    top:26,
    color:'#fff',
    textAlign:'right',
    fontWeight:'600',
    fontSize:14
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
  },
  modalContainer:{
    flex:1,
    paddingTop:50,
    backgroundColor:'#fff'
  },
  fieldItem:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    height:50,
    paddingLeft:15,
    paddingRight:15,
    borderColor:'#eee',
    borderBottomWidth:1
  },
  label:{
    color:'#ccc',
    marginRight:10
  },
  closeIcon:{
    position:'absolute',
    width:40,
    height:40,
    fontSize:32,
    right:20,
    top:30,
    color:'#ee735c'
  },
  gender:{
    backgroundColor:'#ccc'
  },
  genderChecked:{
    backgroundColor:'#ee735c'
  },
  inputField:{
    height:50,
    flex:1,
    color:'#666',
    fontSize:14
  },
  btn:{
    marginTop:25,
    padding:10,
    marginLeft:10,
    marginRight:10,
    backgroundColor:'transparent',
    borderColor:'#ee735c',
    borderWidth:1,
    borderRadius:4,
    color:'#ee735c'
  }
});

export default My