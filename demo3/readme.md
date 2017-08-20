填坑记录：
* 很多组件ios端和android端设置不一样
* 官方说ListView过期，推荐用FlatList和SectionList
* react-native-vector-icons使用的时候name里边不用写前缀
* 最好有模拟器，真机调试更坑
* 在RN中使用ES6开发时，注意组件调用函数需要`bind(this)`，把上下文的this传过去
* 在this只在组件渲染时调用一次，异步的都必须bind
* 官方推荐使用`react-navigation`来进行页面路由跳转~~各种坑
* 在相应页面的navigationOptions中设置`tabBarVisible:false`即可隐藏标签栏，并不是TabNavigator独有


**react-navigation**
* [React Native未来导航者：react-navigation 使用详解](http://blog.csdn.net/sinat_17775997/article/details/72597171)
* [React-navigation之StackNavigator](http://blog.csdn.net/lu1024188315/article/details/73550028)
* [React Navigation 自认比较好的navigator组件(一)](http://www.jianshu.com/p/80408a62d690)
* [REACT NATIVE——REACT-NAVIGATION的使用](http://www.cnblogs.com/CrazyWL/p/7283600.html)