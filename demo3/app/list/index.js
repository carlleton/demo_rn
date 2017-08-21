import React, { Component } from 'react';
import { 
    AppRegistry, 
    StyleSheet, 
    Text, 
    View,
    FlatList,
    Image,
    Dimensions,
    TouchableHighlight,
    ActivityIndicator,
    RefreshControl,
    Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

var request = require('../common/request')
var config = require('../common/config')

var width = Dimensions.get('window').width;

var cacheResults={
    nextPage:1,
    items:[],
    total:0
}

class ListItem extends Component{
    constructor(props) {
      super(props);

      var row=this.props.row;
      this.state = {
        row:row,
        up:row.voted
      };
    }
    _up(){
        console.log('点赞动作')
        var up=!this.state.up;
        var row=this.state.row;
        var url = config.api.up;

        var body={
            id:row._id,
            up:up?'yes':'no'
        };
        request.post(url,body)
            .then((json)=>{
                if(json.result=='0'){
                    this.setState({
                        up:!this.state.up
                    })
                }else{
                    Alert.alert('点赞失败，稍后重试！');
                }
            })
            .catch((err)=>{
                console.log(err);
                Alert.alert('请求出错！');
            })
    }
    render(){
        var row=this.state.row;
        return (<TouchableHighlight onPress={this.props.onSelect}>
            <View style={styles.item}>
                <Text style={styles.title}>{row.title}</Text>
                <Image 
                  source={{uri:row.thumb}}
                  style={styles.thumb}
                >
                     <Icon
                      name="ios-play"
                      size={28}
                      style={styles.play} />
                </Image>
                <View style={styles.itemFooter}>
                    <View style={styles.handleBox}>
                        <Icon
                          name={this.state.up?'ios-heart':'ios-heart-outline'}
                          size={28}
                          style={[styles.up,this.state.up?null:styles.down]}
                          onPress={this._up.bind(this)}
                           />
                        <Text style={styles.handleText} onPress={this._up.bind(this)}>喜欢</Text>
                    </View>
                    <View style={styles.handleBox}>
                        <Icon
                          name="ios-chatboxes-outline"
                          size={28}
                          style={styles.commentIcon} />
                        <Text style={styles.handleText}>评论</Text>
                    </View>
                </View>
            </View>
        </TouchableHighlight>)
    }
}

class List extends Component {
    constructor(props) {
      super(props);
        
      this.state = {
        isLoading:false,
        sourceData:[],
        isRefreshing:false
      };

    }
    componentDidMount(){
        cacheResults.nextPage=1;
        this._fetchData(cacheResults.nextPage);
    }
    _fetchData(page){

        if(page!==0){
            this.setState({
                isLoading:true
            })
        }else{
            this.setState({
                isRefreshing:true
            })
        }
        
        request.get(config.api.list,{
            page:page
        }).then((json) => {
            console.log(json);
            if(json.result=='0'){
                var items = cacheResults.items.slice();
                if(page!==0){
                    cacheResults.items=items.concat(json.data)
                    cacheResults.nextPage+=1;
                    this.setState({
                        sourceData:cacheResults.items.slice(),
                        isLoading:false
                    })
                }else{
                    cacheResults.items=json.data.concat(items)
                    this.setState({
                        sourceData:cacheResults.items.slice(),
                        isRefreshing:false
                    })
                }
                cacheResults.total=json.total;
                
                
            }else{
                console.log(JSON.stringify(json));
            }
          })
          .catch((error) => {
            if(page!==0){
                this.setState({
                    isLoading:false
                })
            }else{
                this.setState({
                    isRefreshing:false
                })
            }
            console.error(error);
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
    _onRefresh(){
        if(!this._hasMore() || this.state.isRefreshing){
            return;
        }
        this._fetchData(0);
    }
    _loadPage(row){
        this.props.navigation.navigate('ListDetail',{
            data:row
        })
    }
    _keyExtractor = (item, index) => item._id
    _renderRow=({item})=>{
        return <ListItem
         key={item._id} 
         onSelect={()=>this._loadPage(item)} 
         row={item} 
         />
    };
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
        return (
          <View style={styles.container}>
            <FlatList
                data={this.state.sourceData}
                renderItem={this._renderRow.bind(this)}
                onEndReached={this._fetchMoreData.bind(this)}
                onEndReachedThreshold={20}
                refreshing={this.state.isRefreshing}
                onRefresh={this._onRefresh.bind(this)}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.isRefreshing}
                        tintColor="#ff0000"
                        title="拼命加载中..."
                        titleColor="#ff6600"
                        colors={['#ff0000', '#00ff00', '#0000ff']}
                        progressBackgroundColor="#ffff00"
                      />
                }
                keyExtractor={this._keyExtractor.bind(this)}
                ListFooterComponent={this._renderFooter.bind(this)}
             />
          </View>
        )
    }
}
var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  header:{
    paddingTop:25,
    paddingBottom:12,
    backgroundColor:'#ee735c'
  },
  headerTitle:{
    color:'#fff',
    fontSize:16,
    textAlign:'center',
    fontWeight:'600'
  },
  item:{
    width:width,
    marginBottom:10,
    backgroundColor:'#fff'
  },
  thumb:{
    width:width,
    height:width * 0.56,
    resizeMode:'cover'
  },
  title:{
    padding:10,
    fontSize:18,
    color:'#333'
  },
  itemFooter:{
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor:'#eee'
  },
  handleBox:{
    padding:10,
    flexDirection:'row',
    width:width/2-0.5,
    justifyContent:'center',
    backgroundColor:'#fff'
  },
  play:{
    position:'absolute',
    bottom:14,
    right:14,
    width:46,
    height:46,
    paddingTop:9,
    paddingLeft:18,
    backgroundColor:'transparent',
    borderColor:'#fff',
    borderWidth:1,
    borderRadius:23,
    color:'#ee7b66'
  },
  handleText:{
    paddingLeft:12,
    fontSize:18,
    color:'#333'
  },
  up:{
    fontSize:22,
    color:'#ee7b66'
  },
  down:{
    fontSize:22,
    color:'#333'
  },
  commentIcon:{
    fontSize:22,
    color:'#333'
  },
  loadingMore:{
    marginVertical:20,
  },
  loadingText:{
    color:'#777',
    textAlign:'center'
  }
});
export default List