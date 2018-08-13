//  引入基类
import { Base } from '../../utils/base.js';
//  用ES6中的class来定义JavaScript中的类
//  让当前类继承自Base基类
class Home extends Base{
  //  定义构造方法
  constructor(){
    //  在当前类的构造方法中调用基类方法，直接使用super();
    super();
  }
  //  自定义获取最近新品部分数据的方法
  getProductsData(callback){
    //  自定义发起请求所需要的参数
    var params = {
        url:'products/recent',
        sCallback:function(res){
          callback && callback(res);
        }
    } 
    //  调用请求发起的方法并将参数传递
    this.request(params);
  }
  //  自定义获取主题部分数据的方法
  getThemeData(callback){
      //  自定义发起请求所需要的参数
      var params = {
        url:'theme?ids=1,2,3',
        sCallback:function(res){
          callback&&callback(res);
        }
      }
      //  调用请求发起的方法并将参数传递
      this.request(params);
  }
  //  单独定义对banner轮播图数据的提取方法
  getBannerData(id,callback){
      //  自定义发起请求所需要的参数
      var params = {
        url:'banner/' + id,
        sCallback:function(res){
          callback && callback(res.items);
        }
      }
      //  继承发起请求的方法
      this.request(params);
      // //  用wx.request内置方法来实现请求服务器接口
      // wx.request({
      //   //  设置请求的URL
      //   url: 'http://api.huiqinsoft.com/api/v1/banner/'+ id,
      //   //  设置请求的发送方式
      //   method:'GET',
      //   //  设置成功获取到结果的处理方法 res参数为异步获取到服务器返回的结果
      //   success:function(res){
      //     //  return res;
      //     //  调用callBack方法将结果传递给callBack
      //     callBack(res);
      //   }
      // })
  }
}
//  将当前类输出使得其他文件可以引用
export{Home};