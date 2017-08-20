填坑记录：
* 很多组件ios端和android端设置不一样
* 官方说ListView过期，推荐用FlatList和SectionList
* react-native-vector-icons使用的时候name里边不用写前缀
* 最好有模拟器，真机调试更坑
* 在RN中使用ES6开发时，注意组件调用函数需要`bind(this)`，把上下文的this传过去
* 在this只在组件渲染时调用一次，异步的都必须bind