import React, { Component } from 'react';
import { 
  AppRegistry, 
  StyleSheet, 
  Text, 
  View,
  TextInput,
  Alert,
  Dimensions,
  AsyncStorage
} from 'react-native';
import Button from 'react-native-button';
import {CountDownText} from 'react-native-sk-countdown';


var request = require('../common/request')
var config = require('../common/config')
var width = Dimensions.get('window').width;

class Login extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      phone:'',
      verifycode:'',
      codeSent:false,
      countingDone:false,//倒计时是否结束
    };
  }
  _countingDone(){
    this.setState({
      countingDone:true
    })
  }
  _submit(){
    var phone=this.state.phone;
    var verifycode=this.state.verifycode;
    if(!phone||!verifycode){
      return Alert.alert('手机号或验证码不能为空！');
    }
    var body={
      phone:phone,
      verifycode:verifycode
    };
    console.log(body);
    var url=config.api.verify;
    request.post(url,body)
      .then((json)=>{
        console.log(json);
        if(json.result=='0'){
          console.log('login ok');
          this.props.afterLogin(json.data);
        }else{
          return Alert.alert('获取验证码失败，请检查手机号是否正确！');
        }
      })
      .catch((err)=>{
        return Alert.alert('获取验证码失败，请检查网络是否良好！');
      })
  }
  _sendVerify(){
    var phone=this.state.phone;
    if(!phone){
      return Alert.alert('手机号不能为空！');
    }
    var body={
      phone:phone
    };
    var url=config.api.signup;
    request.post(url,body)
      .then((json)=>{
        console.log(json);
        if(json.result=='0'){
          this._showVerifyCode(true);
        }else{
          return Alert.alert('获取验证码失败，请检查手机号是否正确！');
        }
      })
      .catch((err)=>{
        return Alert.alert('获取验证码失败，请检查网络是否良好！');
      })
  }
  _showVerifyCode(){
    this.setState({
      codeSent:true
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.signupBox}>
          <Text style={styles.title}>快速登录</Text>
          
            <TextInput
             placeholder='输入手机号'
             autoCapitalize={'none'}
             autoCorrect={false}
             underlineColorAndroid='transparent'
             keyboardType={'numeric'}
             style={styles.inputField}
             onChangeText={(text)=>{
              this.setState({
                phone:text
              })
             }}
            />
          {
            this.state.codeSent
            ? <View style={styles.verifyCodeBox}>
                <TextInput
                 placeholder='输入验证码'
                 autoCapitalize={'none'}
                 autoCorrect={false}
                 underlineColorAndroid='transparent'
                 keyboardType={'numeric'}
                 style={[styles.inputField,styles.inputFieldVerify]}
                 onChangeText={(text)=>{
                  this.setState({
                    verifycode:text
                  })
                 }}
                />
                {
                  this.state.countingDone
                  ? <Button
                     style={styles.countbtn}
                     onPress={this._sendVerify.bind(this)}
                     >获取验证码</Button>
                  : <CountDownText
                      style={styles.countbtn}
                      countType='seconds' // 计时类型：seconds / date
                      auto={true} // 自动开始
                      afterEnd={this._countingDone.bind(this)} // 结束回调
                      timeLeft={60} // 正向计时 时间起点为0秒
                      step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                      startText='获取验证码' // 开始的文本
                      endText='获取验证码' // 结束的文本
                      intervalText={(sec) => '剩余秒数：'+sec} // 定时的文本回调
                     />
                }
              </View>
            : null
          }
          {
            this.state.codeSent
            ? <Button
               style={styles.btn}
               onPress={this._submit.bind(this)}
               >登录</Button>
            : <Button
               style={styles.btn}
               onPress={this._sendVerify.bind(this)}
               >获取验证码</Button>
          }
        </View>

      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:10,
    backgroundColor: '#f9f9f9',
  },
  signupBox:{
    marginTop:30,
  },
  title:{
    marginBottom:20,
    color:'#333',
    fontSize:20,
    textAlign:'center'
  },
  inputField:{
    height:40,
    color:'#666',
    fontSize:16,
    backgroundColor:'#fff',
    borderRadius:4,
    padding:5
  },
  inputFieldVerify:{
    flex:1
  },
  verifyCodeBox:{
    marginTop:10,
    flexDirection:'row',
    justifyContent:'space-between'
  },
  countbtn:{
    height:40,
    padding:10,
    marginLeft:8,
    backgroundColor:'#ee735c',
    color:'#fff',
    borderColor:'#ee735c',
    textAlign:'left',
    fontWeight:'600',
    fontSize:15,
    borderRadius:2,
    flex:1,
  },
  btn:{
    marginTop:10,
    padding:10,
    backgroundColor:'transparent',
    borderColor:'#ee735c',
    borderWidth:1,
    borderRadius:4,
    color:'#ee735c'
  }
});

export default Login