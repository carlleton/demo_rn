import React, { Component } from 'react';
import { 
  AppRegistry, 
  StyleSheet, 
  Text, 
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  AsyncStorage
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-picker';
//var ImagePicker = require('NativeModules').ImagePickerManager;
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
class My extends Component {
  constructor(props) {
    super(props);
    
    //var user = props.user||{}
    this.state = {
      user:{}
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
        user.avatar=avatarData;

        AsyncStorage.setItem('user',JSON.stringify(user));
        this.setState({
          user: user
        });
      }
    });
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
              <Image source={{uri:user.avatar}} style={styles.avatarContainer}>
                <View style={styles.avatarBox}>
                  <Image
                    source={{uri:user.avatar}}
                    style={styles.avatar}
                    />
                </View>
                <Text style={styles.avatarTip}>戳这里换头像</Text>
              </Image>
            </TouchableOpacity>
          : <TouchableOpacity onPress={this._pickPhoto.bind(this)} style={styles.avatarContainer}>
              <Text style={styles.avatarTip}>添加头像</Text>
              <View style={styles.avatarBox}>
                <Icon
                  name="ios-cloud-upload-outline"
                  style={styles.plusIcon}
                  />
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