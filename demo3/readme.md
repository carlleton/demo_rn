填坑记录：
* 很多组件ios端和android端设置不一样
* 官方说ListView过期，推荐用FlatList和SectionList
* react-native-vector-icons使用的时候name里边不用写前缀
* 最好有模拟器，真机调试更坑
* 在RN中使用ES6开发时，注意组件调用函数需要`bind(this)`，把上下文的this传过去
* 在this只在组件渲染时调用一次，异步的都必须bind
* 官方推荐使用`react-navigation`来进行页面路由跳转~~各种坑
* 在相应页面的navigationOptions中设置`tabBarVisible:false`即可隐藏标签栏，并不是TabNavigator独有
* 所有资源使用`uri`，而不是`url`。往往查了半天就是这块的问题
* TextInput如果外层没有设置高度，则会因为高度不够被隐藏
* Android下预iOS下的各组件都有相应的用法和区别，这是react nateive的大坑
* 倒计时组件`react-native-sk-countdown`需要`react-addons-update`
* react-native-sk-countdown在ES6中使用需要更改库中调用代码
* 打包apk总是报` 'ProgressComplete ' (ProgressCompleteEvent)`，使用`gradlew assembleRelease --console plain`尝试

**react-navigation**
* [React Native未来导航者：react-navigation 使用详解](http://blog.csdn.net/sinat_17775997/article/details/72597171)
* [React-navigation之StackNavigator](http://blog.csdn.net/lu1024188315/article/details/73550028)
* [React Navigation 自认比较好的navigator组件(一)](http://www.jianshu.com/p/80408a62d690)
* [REACT NATIVE——REACT-NAVIGATION的使用](http://www.cnblogs.com/CrazyWL/p/7283600.html)
* [react-native-sk-countdown 倒计时组件，不兼容RN 0.30版本](http://coding.imooc.com/learn/questiondetail/2063.html)
* [Build APK Failed 'Unable to process incoming event 'ProgressComplete'](https://github.com/facebook/react-native/issues/10515)
* [RN打包的那些坑儿](http://www.itdadao.com/articles/c15a1316667p0.html)
* [React-Native工程项目打包编译发布过程详解](https://www.ctolib.com/topics-104789.html)

国内镜像：
* [JCenter下载太慢？教你修改Maven仓库地址为国内镜像](http://blog.csdn.net/wuqilianga/article/details/54894367)
* [解决android studio引用远程仓库下载慢(JCenter下载慢)](http://blog.csdn.net/linglingchenchen/article/details/62236723)

